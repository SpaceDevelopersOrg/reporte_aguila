import {
    defineConfig,
    minimal2023Preset as preset,
} from '@vite-pwa/assets-generator/config'

export default defineConfig({
    headLinkOptions: {
        preset: '2023',
    },
    preset: {
        ...preset,
        maskable: {
            sizes: [512],
            resizeOptions: { fit: 'contain', background: '#DBE2DB' },
        },
        apple: {
            sizes: [180],
            resizeOptions: { fit: 'contain', background: '#DBE2DB' },
        },
    },
    images: ['public/logo.png'],
})
