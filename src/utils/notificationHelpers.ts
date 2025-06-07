
import { NotificationType } from '@/context/GlobalNotificationsContext';

// Helper para criar notificações de diferentes tipos
export const createNotificationHelper = (showNotification: (type: NotificationType, title: string, message: string, data?: any) => void) => ({
  // Notificações financeiras
  newTransaction: (amount: number, type: 'income' | 'expense', transactionId: string) => {
    showNotification(
      'transaction',
      'Nova Transação',
      `${type === 'income' ? 'Receita' : 'Despesa'} de R$ ${amount.toFixed(2)} adicionada`,
      { transactionId }
    );
  },

  goalAchieved: (goalName: string, goalId: string) => {
    showNotification(
      'goal_achieved',
      'Meta Atingida! 🎉',
      `Parabéns! Você atingiu a meta "${goalName}"`,
      { goalId }
    );
  },

  paymentReceived: (amount: number, clientName?: string, paymentId?: string) => {
    showNotification(
      'payment_received',
      'Pagamento Recebido',
      `Pagamento de R$ ${amount.toFixed(2)}${clientName ? ` de ${clientName}` : ''} recebido`,
      { paymentId, clientName }
    );
  },

  // Notificações sociais
  newMessage: (senderName: string, messagePreview: string, senderId: string, senderAvatar?: string) => {
    showNotification(
      'message',
      `Nova mensagem de ${senderName}`,
      messagePreview,
      { senderId, senderName, senderAvatar }
    );
  },

  postLiked: (likerName: string, postId: string) => {
    showNotification(
      'social',
      'Curtida no seu post',
      `${likerName} curtiu seu post`,
      { postId, likerName }
    );
  },

  newComment: (commenterName: string, postId: string) => {
    showNotification(
      'social',
      'Novo comentário',
      `${commenterName} comentou no seu post`,
      { postId, commenterName }
    );
  },

  // Notificações de negócios
  newClient: (clientName: string, clientId: string) => {
    showNotification(
      'client_added',
      'Novo Cliente',
      `${clientName} foi adicionado como cliente`,
      { clientId, clientName }
    );
  },

  // Notificações do sistema
  systemUpdate: (message: string) => {
    showNotification(
      'system',
      'Atualização do Sistema',
      message
    );
  },

  dataBackup: (status: 'success' | 'error') => {
    showNotification(
      'system',
      status === 'success' ? 'Backup Realizado' : 'Erro no Backup',
      status === 'success' 
        ? 'Seus dados foram salvos com sucesso' 
        : 'Ocorreu um erro durante o backup'
    );
  }
});

// Tipos de notificação com seus ícones
export const notificationTypeIcons = {
  message: '💬',
  transaction: '💰',
  goal_achieved: '🎯',
  payment_received: '✅',
  client_added: '👤',
  system: '⚙️',
  social: '❤️'
} as const;

// Cores para diferentes tipos de notificação
export const notificationTypeColors = {
  message: 'blue',
  transaction: 'green',
  goal_achieved: 'purple',
  payment_received: 'emerald',
  client_added: 'orange',
  system: 'gray',
  social: 'pink'
} as const;
