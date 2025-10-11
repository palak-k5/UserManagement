<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>User Management System</v-toolbar-title>
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