import { create } from 'zustand';
import { PaymentService, SubscriptionTier } from '../services/paymentService';
import supabase from '../config/supabase';

interface PaymentState {
  // Subscription state
  currentTier: SubscriptionTier;
  subscriptionActive: boolean;
  subscriptionExpiresAt: string | null;

  // Payment history
  cryptoPayments: any[];
  traditionalPayments: any[];

  // UI state
  showPaymentSheet: boolean;
  selectedPaymentMethod: 'crypto' | 'traditional' | null;
  selectedCrypto: { currency: string; chain: string } | null;
  processingPayment: boolean;
  paymentError: string | null;

  // Service
  paymentService: PaymentService | null;

  // Actions
  initializePaymentService: (
    revenueCatKey?: string,
    stripeKey?: string
  ) => void;
  fetchSubscription: (userId: string) => Promise<void>;
  initiateTraditionalPayment: (userId: string, tier: SubscriptionTier) => Promise<void>;
  initiateCryptoPayment: (
    userId: string,
    tier: SubscriptionTier,
    currency: string,
    chain: string,
    walletAddress: string
  ) => Promise<string>;
  verifyCryptoPayment: (paymentId: string, txHash: string) => Promise<boolean>;
  setShowPaymentSheet: (show: boolean) => void;
  setSelectedPaymentMethod: (method: 'crypto' | 'traditional' | null) => void;
  setSelectedCrypto: (selection: { currency: string; chain: string } | null) => void;
  setPaymentError: (error: string | null) => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  // Initial state
  currentTier: 'free',
  subscriptionActive: false,
  subscriptionExpiresAt: null,
  cryptoPayments: [],
  traditionalPayments: [],
  showPaymentSheet: false,
  selectedPaymentMethod: null,
  selectedCrypto: null,
  processingPayment: false,
  paymentError: null,
  paymentService: null,

  // Initialize payment service
  initializePaymentService: (revenueCatKey?: string, stripeKey?: string) => {
    const service = new PaymentService(revenueCatKey, stripeKey);
    set({ paymentService: service });
  },

  // Fetch current subscription
  fetchSubscription: async (userId: string) => {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && subscription) {
        set({
          currentTier: subscription.tier,
          subscriptionActive: true,
          subscriptionExpiresAt: subscription.expires_at,
        });
      } else {
        set({
          currentTier: 'free',
          subscriptionActive: false,
          subscriptionExpiresAt: null,
        });
      }
    } catch (error) {
      console.error('[Payment] Failed to fetch subscription:', error);
      set({ currentTier: 'free', subscriptionActive: false });
    }
  },

  // Initiate traditional payment
  initiateTraditionalPayment: async (userId: string, tier: SubscriptionTier) => {
    const { paymentService } = get();
    if (!paymentService) {
      set({ paymentError: 'Payment service not initialized' });
      return;
    }

    set({ processingPayment: true, paymentError: null });

    try {
      const transactionId = await paymentService.startTraditionalPurchase(userId, tier);
      if (!transactionId) {
        throw new Error('Failed to initiate purchase');
      }

      console.log('[Payment] Traditional purchase initiated:', transactionId);
      // Payment flow continues in native code (RevenueCat)
      set({ processingPayment: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed';
      set({
        processingPayment: false,
        paymentError: message,
      });
    }
  },

  // Initiate crypto payment
  initiateCryptoPayment: async (
    userId: string,
    tier: SubscriptionTier,
    currency: string,
    chain: string,
    walletAddress: string
  ): Promise<string> => {
    const { paymentService } = get();
    if (!paymentService) {
      set({ paymentError: 'Payment service not initialized' });
      throw new Error('Payment service not initialized');
    }

    set({ processingPayment: true, paymentError: null });

    try {
      const payment = await paymentService.createCryptoPayment(
        userId,
        tier,
        currency,
        chain,
        walletAddress
      );

      set({ processingPayment: false });
      return payment.id;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create payment';
      set({
        processingPayment: false,
        paymentError: message,
      });
      throw error;
    }
  },

  // Verify crypto payment
  verifyCryptoPayment: async (paymentId: string, txHash: string): Promise<boolean> => {
    const { paymentService } = get();
    if (!paymentService) {
      set({ paymentError: 'Payment service not initialized' });
      return false;
    }

    set({ processingPayment: true });

    try {
      const isValid = await paymentService.verifyCryptoPayment(paymentId, txHash);

      if (isValid) {
        set({
          processingPayment: false,
          paymentError: null,
        });
      } else {
        set({
          processingPayment: false,
          paymentError: 'Payment verification failed',
        });
      }

      return isValid;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      set({
        processingPayment: false,
        paymentError: message,
      });
      return false;
    }
  },

  // UI setters
  setShowPaymentSheet: (show) => set({ showPaymentSheet: show }),
  setSelectedPaymentMethod: (method) => set({ selectedPaymentMethod: method }),
  setSelectedCrypto: (selection) => set({ selectedCrypto: selection }),
  setPaymentError: (error) => set({ paymentError: error }),
}));
