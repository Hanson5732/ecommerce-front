<template>
  <div class="not-found">
    <h1>404 - Page Not Found</h1>
    <p>Sorry, the page you are looking for does not exist.</p>
    <p v-if="$route.query.attempted">
      You tried to access: <code>{{ $route.query.attempted }}</code>
    </p>
    <router-link to="/">Go to Home</router-link>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 2rem;
}

h1 {
  color: #000000;
  margin-bottom: 1rem;
}

p {
  margin-bottom: 1rem;
}

a {
  color: #42b983;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
