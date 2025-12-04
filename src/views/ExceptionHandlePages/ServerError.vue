<template>
  <div class="server-error">
    <h1>500 - Server Error</h1>
    <p>Sorry, something went wrong on our end.</p>
    <p v-if="$route.query.error">
      Error details: <code>{{ $route.query.error }}</code>
    </p>
    <router-link to="/">Return to Home</router-link>
  </div>
</template>

<style scoped>
.server-error {
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
