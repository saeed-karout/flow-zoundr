<template>
    <div class="main">
        <div class="left">Dein Verfügbares Guthaben</div>
        <div class="right">{{ formattedBalance }}</div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import apiRequest from '@/lib/apiRequest';

// ========== Reactive Data ==========
const balance = ref(0);
const isLoading = ref(false);
const userUuid = ref(null);
const userName = ref(null);
const userEmail = ref(null);

// ========== Computed ==========

const formattedBalance = computed(() => {
    if (balance.value === null || balance.value === undefined) {
        return '0,00 EUR';
    }
    
    // تحويل إلى رقم إذا كان string
    const num = typeof balance.value === 'string' ? parseFloat(balance.value) : balance.value;
    
    // تنسيق الرقم مع فاصل الآلاف
    const formatted = num.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    return `${formatted} EUR`;
});

// ========== جلب بيانات المستخدم ==========
const getUserData = () => {
    try {
        // محاولة جلب بيانات المستخدم من localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            userUuid.value = parsed.uuid || parsed.id;
            userName.value = parsed.name || parsed.username;
            userEmail.value = parsed.email;
            console.log('👤 User data loaded from localStorage');
            return true;
        }
        
        // محاولة جلب من sessionStorage
        const sessionUser = sessionStorage.getItem('user');
        if (sessionUser) {
            const parsed = JSON.parse(sessionUser);
            userUuid.value = parsed.uuid || parsed.id;
            userName.value = parsed.name || parsed.username;
            userEmail.value = parsed.email;
            console.log('👤 User data loaded from sessionStorage');
            return true;
        }
        
        console.warn('⚠️ No user data found in storage');
        return false;
    } catch (error) {
        console.error('❌ Error parsing user data:', error);
        return false;
    }
};

// ========== جلب الرصيد ==========
const fetchBalance = async () => {
    // التأكد من وجود بيانات المستخدم
    if (!userUuid.value || !userName.value || !userEmail.value) {
        console.warn('⚠️ Missing user data, cannot fetch balance');
        balance.value = 0;
        return;
    }
    
    isLoading.value = true;
    
    try {
        
        const params = new URLSearchParams({
            user_uuid: userUuid.value,
            user_name: encodeURIComponent(userName.value),
            user_email: encodeURIComponent(userEmail.value)
        });
        
        const url = `/wallet/balance?${params.toString()}`;
        console.log('💰 Fetching balance from:', url);
        
        const response = await apiRequest.get(url);
        console.log('✅ Balance response:', response.data);
        
        // معالجة response واستخراج الرصيد
        if (response.data) {
            // إذا كان الرصيد مباشراً في data
            if (typeof response.data === 'number') {
                balance.value = response.data;
            } 
            // إذا كان في data.balance
            else if (response.data.balance !== undefined) {
                balance.value = response.data.balance;
            }
            // إذا كان في data.data.balance
            else if (response.data.data && response.data.data.balance !== undefined) {
                balance.value = response.data.data.balance;
            }
            // إذا كان في data.amount
            else if (response.data.amount !== undefined) {
                balance.value = response.data.amount;
            }
           
            else {
                const possibleFields = ['total', 'amount', 'value', 'credit', 'balance_amount', 'balance'];
                let found = false;
                for (const field of possibleFields) {
                    if (response.data[field] !== undefined && typeof response.data[field] === 'number') {
                        balance.value = response.data[field];
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    console.warn('⚠️ Could not find balance in response:', response.data);
                    balance.value = 0;
                }
            }
        } else {
            balance.value = 0;
        }
        
        console.log('💰 Final balance:', balance.value);
        
    } catch (error) {
        console.error('❌ Error fetching balance:', error);
        balance.value = 0;
        
        // إذا كان الخطأ 401 أو 403، المستخدم غير موثوق
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn('⚠️ Authentication error, user may not be logged in');
        }
    } finally {
        isLoading.value = false;
    }
};

// ========== Lifecycle ==========
onMounted(async () => {
    // 1. جلب بيانات المستخدم
    const userLoaded = getUserData();
    
    // 2. جلب الرصيد إذا توفرت بيانات المستخدم
    if (userLoaded) {
        await fetchBalance();
    } else {
        console.warn('⚠️ Skipping balance fetch - no user data');
        balance.value = 0;
    }
});

// ========== Export ==========
defineExpose({
    refreshBalance: fetchBalance // للسماح بتحديث الرصيد من الخارج
});
</script>

<style lang="scss" scoped>
.main {
    display: flex;
    padding: 13px 20px 13px 20px;
    justify-content: space-between;
    align-items: center;
    flex: 1 0 0;
    align-self: stretch;
    border-radius: 20px 5px 5px 20px;
    background: linear-gradient(90deg, var(--secondary) 0%, var(--Strawberry) 100%);
}

.left {
    color: #fff;
    font-family: Heebo;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: .6;
    text-transform: uppercase;
}

.right {
    color: #FFF;
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: .6;
    text-transform: uppercase;
    white-space: nowrap; /* منع التفاف النص */
}

/* حالة التحميل */
.loading {
    opacity: 0.6;
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
}

@media (min-width: 1440px) and (max-width: 1599px) {
    .left {
        font-size: 14px;
    }
    .right {
        font-size: 18px;
    }
}

@media (max-width: 1439px) {
    .left {
        font-size: 14px;
    }
    .right {
        font-size: 16px;
    }
}
</style>