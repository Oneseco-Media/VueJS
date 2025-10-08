<template>
  <div class="landing">
    <div class="container">
      <h1>Welcome!</h1>
      <p>Please log in to continue</p>
      <a href="/api/login" class="login-button">Log In</a>
    </div>
  </div>
</template>

<style scoped>
.landing {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.container {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: #666;
}

.login-button {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: #42b883;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #359268;
}
</style>
