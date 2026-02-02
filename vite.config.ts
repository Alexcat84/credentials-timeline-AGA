import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const GA_ID = process.env.VITE_GA_MEASUREMENT_ID || '';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'inject-ga',
      transformIndexHtml(html) {
        if (!GA_ID) return html;
        const gaScript = `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}', { send_page_view: false, anonymize_ip: true });
    </script>`;
        return html.replace('</head>', `${gaScript}\n  </head>`);
      },
    },
  ],
});
