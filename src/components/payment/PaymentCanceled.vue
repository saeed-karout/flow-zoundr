
<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToPayment = () => {
  router.push('/payment'); 
};
</script>
