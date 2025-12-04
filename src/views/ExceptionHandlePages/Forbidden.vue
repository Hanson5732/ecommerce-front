<template>
  <div class="forbidden">
    <h1>403 - Access Forbidden</h1>
    <p>Sorry, you are not authorized to view this page.</p>
    <p v-if="$route.query.attempted">
      Attempted access: <code>{{ $route.query.attempted }}</code>
    </p>
    <router-link to="/">Return to Home</router-link>
  </div>
</template>

<style scoped>
.forbidden {
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
