import { ref, computed } from 'vue';

const user = ref(null);
const isLoading = ref(true);

export function useAuth() {
  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        user.value = await response.json();
      } else {
        user.value = null;
      }
    } catch (error) {
      user.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  const isAuthenticated = computed(() => !!user.value);

  if (isLoading.value && user.value === null) {
    fetchUser();
  }

  return {
    user,
    isLoading,
    isAuthenticated
  };
}
