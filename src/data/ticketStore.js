// Global ticket store to maintain state across requests
let tickets = [
  {
    id: 1,
    userId: 1,
    subject: 'Hesap doğrulama sorunu',
    category: 'account',
    priority: 'high',
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      firstName: 'User',
      lastName: 'One',
      email: 'user1@test.com'
    },
    messages: [
      {
        id: 1,
        ticketId: 1,
        senderId: 1,
        senderType: 'user',
        message: 'Hesabımı doğrulatamıyorum, yardım edebilir misiniz?',
        createdAt: new Date().toISOString(),
        sender: {
          firstName: 'User',
          lastName: 'One',
          email: 'user1@test.com',
          role: 'user'
        }
      }
    ]
  },
  {
    id: 2,
    userId: 1,
    subject: 'Para yatırma işlemi',
    category: 'deposit',
    priority: 'medium',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      firstName: 'User',
      lastName: 'Two',
      email: 'user2@test.com'
    },
    messages: [
      {
        id: 2,
        ticketId: 2,
        senderId: 1,
        senderType: 'user',
        message: 'Para yatırma işlemim 2 gündür beklemede, ne zaman onaylanacak?',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        sender: {
          firstName: 'User',
          lastName: 'Two',
          email: 'user2@test.com',
          role: 'user'
        }
      },
      {
        id: 3,
        ticketId: 2,
        senderId: 2,
        senderType: 'admin',
        message: 'Merhaba, işleminizi inceliyoruz. En kısa sürede dönüş yapacağız.',
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        sender: {
          firstName: 'Admin',
          lastName: 'Support',
          email: 'admin@diapk.com',
          role: 'admin'
        }
      }
    ]
  },
  {
    id: 3,
    userId: 16,
    subject: 'Test ticket',
    category: 'general',
    priority: 'low',
    status: 'open',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      firstName: 'Test',
      lastName: 'User1',
      email: 'user1@test.com'
    },
    messages: [
      {
        id: 1757602396783,
        ticketId: 3,
        senderId: 16,
        senderType: 'user',
        message: '1111',
        createdAt: '2025-09-11T14:53:16.783Z',
        sender: {
          firstName: 'Test',
          lastName: 'User1',
          email: 'user1@test.com',
          role: 'user'
        }
      }
    ]
  },
  {
    id: 4,
    userId: 16,
    subject: 'Another test',
    category: 'technical',
    priority: 'medium',
    status: 'open',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      firstName: 'Test',
      lastName: 'User1',
      email: 'user1@test.com'
    },
    messages: [
      {
        id: 4,
        ticketId: 4,
        senderId: 16,
        senderType: 'user',
        message: 'Bu bir test mesajıdır.',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        sender: {
          firstName: 'Test',
          lastName: 'User1',
          email: 'user1@test.com',
          role: 'user'
        }
      }
    ]
  },
  {
    id: 1757604229892,
    userId: 15,
    subject: 'Test admin mesajı',
    category: 'general',
    priority: 'medium',
    status: 'open',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      firstName: 'Current',
      lastName: 'User',
      email: 'current@test.com'
    },
    messages: [
      {
        id: 1757604229893,
        ticketId: 1757604229892,
        senderId: 15,
        senderType: 'user',
        message: 'Test mesajı - kullanıcıdan admin\'e',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        sender: {
          firstName: 'Current',
          lastName: 'User',
          email: 'current@test.com',
          role: 'user'
        }
      },
      {
        id: 1757604229894,
        ticketId: 1757604229892,
        senderId: 2,
        senderType: 'admin',
        message: 'Admin test cevabı - bu mesaj kullanıcıya ulaşmalı',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        sender: {
          firstName: 'Admin',
          lastName: 'Support',
          email: 'admin@diapk.com',
          role: 'admin'
        }
      }
    ]
  }
];

class TicketStore {
  static getTickets() {
    return tickets;
  }

  static getTicketById(id) {
    return tickets.find(ticket => ticket.id === parseInt(id));
  }

  static getUserTickets(userId) {
    return tickets.filter(ticket => ticket.userId === parseInt(userId));
  }

  static addMessage(ticketId, message) {
    const ticket = this.getTicketById(ticketId);
    if (ticket) {
      ticket.messages.push(message);
      ticket.updatedAt = new Date().toISOString();
      return message;
    }
    return null;
  }

  static updateTicketStatus(ticketId, status) {
    const ticket = this.getTicketById(ticketId);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date().toISOString();
      return ticket;
    }
    return null;
  }

  static createTicket(ticketData) {
    const newTicket = {
      id: Date.now(),
      ...ticketData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    tickets.push(newTicket);
    return newTicket;
  }
}

module.exports = TicketStore;