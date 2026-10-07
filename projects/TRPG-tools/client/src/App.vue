<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
};
</script>

<style>
#app {
  min-width: 500px;
  max-width: 900px;
  height: 100%;
  margin: 0 auto;
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
  background: white;
  font-size: 14px;
}
</style>
