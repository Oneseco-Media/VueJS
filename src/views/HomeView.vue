<script setup>
import { useAuth } from '@/composables/useAuth'

const { user } = useAuth()
</script>

<template>
  <main>
    <div class="home">
      <div class="container">
        <div class="user-info" v-if="user">
          <img 
            v-if="user.profileImageUrl" 
            :src="user.profileImageUrl" 
            :alt="user.firstName || 'User'" 
            class="profile-image"
          />
          <h1>Welcome{{ user.firstName ? `, ${user.firstName}` : '' }}!</h1>
          <p v-if="user.email">{{ user.email }}</p>
        </div>
        <a href="/api/logout" class="logout-button">Log Out</a>
      </div>
    </div>
  </main>
</template>

<style scoped>
.home {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.container {
  text-align: center;
  padding: 2rem;
}

.user-info {
  margin-bottom: 2rem;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

p {
  color: #666;
  margin-bottom: 1.5rem;
}

.logout-button {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: #42b883;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: #359268;
}
</style>
