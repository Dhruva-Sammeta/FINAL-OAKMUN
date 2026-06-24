import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        allocations: resolve(__dirname, 'allocations.html'),
        committee: resolve(__dirname, 'committee.html'),
        committees: resolve(__dirname, 'committees.html'),
        delegationGuidelines: resolve(__dirname, 'delegation-guidelines.html'),
        networkingHour: resolve(__dirname, 'networking-hour.html'),
        orphanageInitiative: resolve(__dirname, 'orphanage-initiative.html'),
        register: resolve(__dirname, 'register.html'),
        registrationForm: resolve(__dirname, 'registration-form.html'),
        resources: resolve(__dirname, 'resources.html'),
        secretariat: resolve(__dirname, 'secretariat.html'),
        socialNight: resolve(__dirname, 'social-night.html'),
      },
    },
  },
});
