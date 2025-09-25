const { StockQuote } = require('../models');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

class StockQuoteUpdater {
  static async updateStockQuotes() {
    try {
      // BIST 100 hisse senetlerinin listesi (örnek)
      const symbols = [
        'AKBNK', 'ARCLK', 'ASELS', 'BIMAS', 'EKGYO', 'EREGL', 'FROTO',
        'GARAN', 'HALKB', 'ISCTR', 'KCHOL', 'KOZAL', 'KOZAA', 'KRDMD',
        'PETKM', 'PGSUS', 'SAHOL', 'SASA', 'SISE', 'SKBNK', 'TAVHL',
        'TCELL', 'THYAO', 'TKFEN', 'TOASO', 'TUPRS', 'VAKBN', 'YKBNK'
      ];

      const updates = [];
      
      for (const symbol of symbols) {
        try {
          // Alpha Vantage API ile gerçek veri çekme
          const quoteData = await this.fetchRealQuote(symbol);
          
          const [quote, created] = await StockQuote.upsert({
            symbol: quoteData.symbol,
            exchange: 'BIST',
            price: quoteData.price,
            changePercent: quoteData.changePercent,
            changeAmount: quoteData.changeAmount,
            volume: quoteData.volume,
            high: quoteData.high,
            low: quoteData.low,
            open: quoteData.open,
            previousClose: quoteData.previousClose,
            marketCap: quoteData.marketCap,
            lastUpdated: new Date()
          }, {
            returning: true
          });

          updates.push({
            symbol: quoteData.symbol,
            price: quoteData.price,
            change: quoteData.changePercent,
            created
          });

          // Alpha Vantage API rate limiting (5 calls per minute)
          // Güvenli olmak için 15 saniye bekleme
          await new Promise(resolve => setTimeout(resolve, 15000));
        } catch (error) {
          console.error(`${symbol} güncellenirken hata:`, error.message);
        }
      }

      console.log(`Stock Quotes Update: ${updates.length} hisse senedi güncellendi`);
      return updates;
    } catch (error) {
      console.error('Stock quotes update error:', error);
      throw error;
    }
  }

  // Fallback method for when APIs are unavailable
  static generateFallbackQuote(symbol) {
    console.warn(`Using fallback data for ${symbol} - API unavailable`);
    
    // Return null to indicate no data available
    // This will prevent storing invalid data in the database
    return null;
  }

  // Yahoo Finance API ile Türk hisse senedi verisi çekme
  static async fetchYahooFinanceQuote(symbol) {
    try {
      // Yahoo Finance için Türk hisse senetleri .IS ile biter
      const yahooSymbol = `${symbol}.IS`;
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`;
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const data = response.data;
      
      if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
        console.warn(`${symbol} için Yahoo Finance'da veri bulunamadı`);
        return this.generateMockQuote(symbol);
      }

      const result = data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];
      
      if (!meta || !quote) {
        console.warn(`${symbol} için geçersiz Yahoo Finance verisi`);
        return this.generateMockQuote(symbol);
      }

      const currentPrice = meta.regularMarketPrice || meta.previousClose;
      const previousClose = meta.previousClose;
      const changeAmount = currentPrice - previousClose;
      const changePercent = (changeAmount / previousClose) * 100;

      return {
        symbol,
        price: parseFloat(currentPrice.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        changeAmount: parseFloat(changeAmount.toFixed(2)),
        volume: meta.regularMarketVolume || 0,
        high: meta.regularMarketDayHigh || currentPrice,
        low: meta.regularMarketDayLow || currentPrice,
        open: meta.regularMarketOpen || previousClose,
        previousClose: parseFloat(previousClose.toFixed(2)),
        marketCap: meta.marketCap || null
      };
    } catch (error) {
      console.error(`Yahoo Finance API'den ${symbol} verisi alınırken hata:`, error.message);
      return this.generateMockQuote(symbol);
    }
  }

  // Alpha Vantage API ile uluslararası hisse senedi verisi çekme
  static async fetchAlphaVantageQuote(symbol) {
    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      if (!apiKey) {
        console.warn('Alpha Vantage API key bulunamadı, Yahoo Finance kullanılıyor');
        return this.fetchYahooFinanceQuote(symbol);
      }

      // Alpha Vantage Global Quote endpoint
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
      const response = await axios.get(url, {
        timeout: 10000
      });

      const data = response.data;
      
      // API hatası kontrolü
      if (data['Error Message'] || data['Note']) {
        console.warn(`Alpha Vantage API hatası ${symbol} için:`, data['Error Message'] || data['Note']);
        return this.fetchYahooFinanceQuote(symbol);
      }

      const quote = data['Global Quote'];
      if (!quote || !quote['05. price']) {
        console.warn(`${symbol} için Alpha Vantage'da veri bulunamadı, Yahoo Finance deneniyor`);
        return this.fetchYahooFinanceQuote(symbol);
      }

      // Alpha Vantage verisini sisteme uygun formata çevirme
      const price = parseFloat(quote['05. price']);
      const changeAmount = parseFloat(quote['09. change']);
      const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
      const previousClose = parseFloat(quote['08. previous close']);
      const volume = parseInt(quote['06. volume']) || 0;
      const high = parseFloat(quote['03. high']);
      const low = parseFloat(quote['04. low']);
      const open = parseFloat(quote['02. open']);

      return {
        symbol,
        price,
        changePercent,
        changeAmount,
        volume,
        high,
        low,
        open,
        previousClose,
        marketCap: null // Alpha Vantage Global Quote'da market cap yok
      };
    } catch (error) {
      console.error(`Alpha Vantage API'den ${symbol} verisi alınırken hata:`, error.message);
      // Fallback olarak Yahoo Finance kullan
      return this.fetchYahooFinanceQuote(symbol);
    }
  }

  // Gerçek API entegrasyonu için bu metod kullanılacak
  static async fetchRealQuote(symbol) {
    try {
      // Türk hisse senetleri için önce Yahoo Finance dene
      const bistSymbols = [
        'AKBNK', 'ARCLK', 'ASELS', 'BIMAS', 'EKGYO', 'EREGL', 'FROTO',
        'GARAN', 'HALKB', 'ISCTR', 'KCHOL', 'KOZAL', 'KOZAA', 'KRDMD',
        'PETKM', 'PGSUS', 'SAHOL', 'SASA', 'SISE', 'SKBNK', 'TAVHL',
        'TCELL', 'THYAO', 'TKFEN', 'TOASO', 'TUPRS', 'VAKBN', 'YKBNK'
      ];
      
      if (bistSymbols.includes(symbol)) {
        return await this.fetchYahooFinanceQuote(symbol);
      }
      // Uluslararası hisseler için Alpha Vantage kullan
      return await this.fetchAlphaVantageQuote(symbol);
    } catch (error) {
      console.error(`API'den ${symbol} verisi alınırken hata:`, error.message);
      // Fallback olarak mock data kullan
      return this.generateMockQuote(symbol);
    }
  }

  static async getTopMovers(limit = 10) {
    try {
      const topGainers = await StockQuote.findAll({
        where: {
          changePercent: {
            [StockQuote.sequelize.Op.gt]: 0
          }
        },
        order: [['changePercent', 'DESC']],
        limit
      });

      const topLosers = await StockQuote.findAll({
        where: {
          changePercent: {
            [StockQuote.sequelize.Op.lt]: 0
          }
        },
        order: [['changePercent', 'ASC']],
        limit
      });

      const mostActive = await StockQuote.findAll({
        order: [['volume', 'DESC']],
        limit
      });

      return {
        topGainers,
        topLosers,
        mostActive
      };
    } catch (error) {
      console.error('Top movers error:', error);
      throw error;
    }
  }

  static async getMarketSummary() {
    try {
      const totalStocks = await StockQuote.count();
      const gainers = await StockQuote.count({
        where: {
          changePercent: {
            [StockQuote.sequelize.Op.gt]: 0
          }
        }
      });
      const losers = await StockQuote.count({
        where: {
          changePercent: {
            [StockQuote.sequelize.Op.lt]: 0
          }
        }
      });
      const unchanged = totalStocks - gainers - losers;

      return {
        totalStocks,
        gainers,
        losers,
        unchanged,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Market summary error:', error);
      throw error;
    }
  }
}

module.exports = {
  StockQuoteUpdater,
  updateStockQuotes: () => StockQuoteUpdater.updateStockQuotes(),
  getTopMovers: (limit) => StockQuoteUpdater.getTopMovers(limit),
  getMarketSummary: () => StockQuoteUpdater.getMarketSummary()
};