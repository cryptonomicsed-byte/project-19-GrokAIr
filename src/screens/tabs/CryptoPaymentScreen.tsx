import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { usePaymentStore } from '../../stores/paymentStore';

interface CryptoOption {
  currency: string;
  chain: string;
  amount: string;
  usdValue: number;
}

export default function CryptoPaymentScreen() {
  const user = useAuthStore((s) => s.user);
  const {
    paymentService,
    showPaymentSheet,
    processingPayment,
    paymentError,
    selectedCrypto,
    initializePaymentService,
    initiateCryptoPayment,
    verifyCryptoPayment,
    setShowPaymentSheet,
    setSelectedCrypto,
    setPaymentError,
  } = usePaymentStore();

  const [tier, setTier] = useState<'pro' | 'elite'>('pro');
  const [cryptoOptions, setCryptoOptions] = useState<CryptoOption[]>([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'verify'>('select');

  useEffect(() => {
    // Initialize payment service
    initializePaymentService(
      process.env.EXPO_PUBLIC_REVENUCAT_API_KEY,
      process.env.EXPO_PUBLIC_STRIPE_API_KEY
    );
  }, []);

  useEffect(() => {
    if (paymentService) {
      const pricing = paymentService.getPricing(tier);
      const options: CryptoOption[] = pricing.currencyOptions.map((opt) => ({
        ...opt,
        usdValue: pricing.amountUSD,
      }));
      setCryptoOptions(options);
    }
  }, [paymentService, tier]);

  const handleSelectCrypto = (option: CryptoOption) => {
    setSelectedCrypto({
      currency: option.currency,
      chain: option.chain,
    });
    setStep('confirm');
  };

  const handleInitiatePayment = async () => {
    if (!user || !selectedCrypto || !walletAddress) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/) && !walletAddress.match(/^[1-9A-HJ-NP-Z]{32,44}$/)) {
      Alert.alert('Error', 'Invalid wallet address');
      return;
    }

    try {
      const id = await initiateCryptoPayment(
        user.id,
        tier,
        selectedCrypto.currency,
        selectedCrypto.chain,
        walletAddress
      );

      setPaymentId(id);
      setStep('verify');

      Alert.alert(
        'Payment Initiated',
        `Send ${selectedCrypto.amount} ${selectedCrypto.currency} on ${selectedCrypto.chain} to complete payment.\n\nAmount: ${selectedCrypto.amount} ${selectedCrypto.currency}\nChain: ${selectedCrypto.chain.toUpperCase()}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to initiate payment');
    }
  };

  const handleVerifyPayment = async () => {
    if (!txHash || !paymentId) {
      Alert.alert('Error', 'Please enter transaction hash');
      return;
    }

    try {
      const success = await verifyCryptoPayment(paymentId, txHash);

      if (success) {
        Alert.alert('Success', 'Payment verified! Subscription activated.');
        setStep('select');
        setTxHash('');
        setWalletAddress('');
        setSelectedCrypto(null);
        setPaymentId('');
      } else {
        Alert.alert('Error', 'Payment verification failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Verification failed');
    }
  };

  if (!paymentService) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading payment service...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Crypto Payment
      </Text>

      {/* Tier Selection */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Select Plan
        </Text>
        <TouchableOpacity
          onPress={() => setTier('pro')}
          style={{
            padding: 12,
            borderRadius: 8,
            backgroundColor: tier === 'pro' ? '#4f46e5' : '#f3f4f6',
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontWeight: '600',
              color: tier === 'pro' ? '#fff' : '#000',
            }}
          >
            Pro - $12/month
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTier('elite')}
          style={{
            padding: 12,
            borderRadius: 8,
            backgroundColor: tier === 'elite' ? '#4f46e5' : '#f3f4f6',
          }}
        >
          <Text
            style={{
              fontWeight: '600',
              color: tier === 'elite' ? '#fff' : '#000',
            }}
          >
            Elite - $20/month
          </Text>
        </TouchableOpacity>
      </View>

      {/* Crypto Options */}
      {step === 'select' && (
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Choose Cryptocurrency
          </Text>
          {cryptoOptions.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleSelectCrypto(option)}
              style={{
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#f3f4f6',
                marginBottom: 8,
                borderLeftWidth: 4,
                borderLeftColor: '#4f46e5',
              }}
            >
              <Text style={{ fontWeight: '600' }}>
                {option.currency} ({option.chain})
              </Text>
              <Text style={{ color: '#666', marginTop: 4 }}>
                Amount: {option.amount} {option.currency}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Confirm Step */}
      {step === 'confirm' && selectedCrypto && (
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Confirm Payment
          </Text>

          <View
            style={{
              padding: 12,
              backgroundColor: '#f3f4f6',
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <View style={{ marginBottom: 8 }}>
              <Text style={{ color: '#666' }}>Currency</Text>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>
                {selectedCrypto.currency}
              </Text>
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text style={{ color: '#666' }}>Chain</Text>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>
                {selectedCrypto.chain.toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={{ color: '#666' }}>Plan</Text>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>{tier}</Text>
            </View>
          </View>

          {/* Wallet Address Input */}
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6 }}>
            Your Wallet Address
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: walletAddress ? '#000' : '#999',
                fontSize: 12,
              }}
            >
              {walletAddress || 'Enter your wallet address...'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleInitiatePayment}
            disabled={processingPayment || !walletAddress}
            style={{
              padding: 16,
              borderRadius: 8,
              backgroundColor: processingPayment ? '#ccc' : '#4f46e5',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            {processingPayment ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
                Continue to Payment
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setStep('select')}
            style={{
              padding: 16,
              borderRadius: 8,
              backgroundColor: '#f3f4f6',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: '600', fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Verify Step */}
      {step === 'verify' && (
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Verify Transaction
          </Text>

          <Text style={{ color: '#666', marginBottom: 16 }}>
            Enter your transaction hash to confirm payment
          </Text>

          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6 }}>
            Transaction Hash
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: txHash ? '#000' : '#999',
                fontSize: 12,
              }}
            >
              {txHash || 'Paste transaction hash (0x...)'}
            </Text>
          </View>

          {paymentError && (
            <View
              style={{
                padding: 12,
                backgroundColor: '#fee2e2',
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#991b1b' }}>{paymentError}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleVerifyPayment}
            disabled={processingPayment || !txHash}
            style={{
              padding: 16,
              borderRadius: 8,
              backgroundColor: processingPayment ? '#ccc' : '#10b981',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            {processingPayment ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
                Verify & Activate
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setStep('select');
              setPaymentId('');
            }}
            style={{
              padding: 16,
              borderRadius: 8,
              backgroundColor: '#f3f4f6',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: '600', fontSize: 16 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
