<template>
  <v-app>
    <v-app-bar app color="primary" dark class="d-flex justify-center">
  <v-toolbar-title class="text-h6 text-center">
    User Management System
  </v-toolbar-title>
</v-app-bar>
<v-main>
      <v-container fluid>
        <UserTable />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import UserTable from './components/UserTable.vue'

export default {
  name: 'App',
  components: {
    UserTable
  }
}
</script>