import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Skeleton,
  Link
} from '@mui/material';
import {
  TrendingUp,
  Refresh,
  OpenInNew,
  NewReleases
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { newsService, type NewsItem } from '../../services/newsService';

const NewsWidget: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);

  // Load news data from service
  const loadNews = async () => {
    try {
      setIsLoading(true);
      const newsData = await newsService.getTopNews(8);
      setNews(newsData);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh news data
  const handleRefresh = async () => {
    await loadNews();
    setCurrentIndex(0);
  };

  useEffect(() => {
    loadNews();
  }, []);

  // Auto-rotate news every 5 seconds
  useEffect(() => {
    if (news.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [news.length]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'market': return theme.palette.primary.main;
      case 'economy': return theme.palette.success.main;
      case 'crypto': return theme.palette.warning.main;
      default: return theme.palette.info.main;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'market': return <TrendingUp />;
      case 'economy': return <NewReleases />;
      default: return <NewReleases />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${t('news.minutesAgo')}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${t('news.hoursAgo')}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} ${t('news.daysAgo')}`;
    }
  };

  if (isLoading) {
    return (
      <Card sx={{ 
        height: 'fit-content',
        background: 'linear-gradient(145deg, #ffffff 0%, #f0f8ff 100%)',
        border: '1px solid rgba(26, 35, 126, 0.08)',
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="text" width={120} height={32} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 1 }} />
            <Skeleton variant="text" width="60%" />
          </Box>
          <List sx={{ p: 0 }}>
            {[1, 2, 3].map((item) => (
              <ListItem key={item} sx={{ px: 0, py: 1 }}>
                <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }

  const currentNews = news[currentIndex];

  return (
    <Card sx={{ 
      height: 'fit-content',
      background: 'linear-gradient(145deg, #ffffff 0%, #f0f8ff 100%)',
      border: '1px solid rgba(26, 35, 126, 0.08)',
    }}>
      <CardContent>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ 
              bgcolor: 'primary.main', 
              width: 40, 
              height: 40 
            }}>
              <NewReleases />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('news.title')}
            </Typography>
          </Box>
          <IconButton 
            onClick={handleRefresh}
            size="small"
            sx={{ 
              bgcolor: 'rgba(26, 35, 126, 0.08)',
              '&:hover': {
                bgcolor: 'rgba(26, 35, 126, 0.12)',
              }
            }}
          >
            <Refresh fontSize="small" />
          </IconButton>
        </Box>

        {/* Featured News */}
        {currentNews && (
          <Box sx={{ 
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(26, 35, 126, 0.04)',
            mb: 2,
            border: '1px solid rgba(26, 35, 126, 0.08)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'rgba(26, 35, 126, 0.08)',
              transform: 'translateY(-1px)',
            }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Chip
                icon={getCategoryIcon(currentNews.category)}
                label={t(`news.category.${currentNews.category}`)}
                size="small"
                sx={{
                  bgcolor: getCategoryColor(currentNews.category),
                  color: 'white',
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: 'white'
                  }
                }}
              />
              <IconButton size="small">
                <OpenInNew fontSize="small" />
              </IconButton>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>
                {currentNews.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {currentNews.summary}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={t(`news.categories.${currentNews.category}`)}
                  size="small"
                  sx={{
                    backgroundColor: getCategoryColor(currentNews.category),
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.7rem'
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {formatTimeAgo(currentNews.publishedAt)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* News List */}
        <List sx={{ p: 0 }}>
          {news.slice(0, 4).map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem 
                sx={{ 
                  px: 0, 
                  py: 1.5,
                  cursor: 'pointer',
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(26, 35, 126, 0.04)',
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: getCategoryColor(item.category),
                    mr: 2
                  }}
                >
                  {getCategoryIcon(item.category)}
                </Avatar>
                <ListItemText
                  primary={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {item.title}
                    </Typography>
                  }
                  secondary={
                    <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                      <Typography variant="caption" color="text.secondary" component="span">
                        {item.source}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="span">
                        {formatTimeAgo(item.publishedAt)}
                      </Typography>
                    </span>
                  }
                />
              </ListItem>
              {index < news.slice(0, 4).length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {/* View All Link */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link 
            href="#" 
            sx={{ 
              color: 'primary.main',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {t('news.viewAll')}
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NewsWidget;