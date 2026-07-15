# Tannu Frontend

Yeh repository "Tannu" project ka frontend hai — ek halka React + Vite based single-page application jo JavaScript aur CSS ka istemal karta hai.

## Features

- React + Vite ke saath fast development server aur HMR
- Seed project structure for building UI components
- Simple build & preview scripts

## Zaroori Commands

Repository clone karne ke baad:

- Install dependencies:

  ```bash
  npm install
  ```

- Development server chalane ke liye:

  ```bash
  npm run dev
  ```

- Production build banane ke liye:

  ```bash
  npm run build
  ```

- Build ko local preview karne ke liye:

  ```bash
  npm run preview
  ```

(Ye commands package.json me maujood scripts par depend karte hain — agar aap yarn ya pnpm use karte hain to corresponding commands use karein.)

## Project Structure (overview)

- src/       — React components aur app source
- public/    — Static assets
- index.html — App entry

## Technologies

- JavaScript
- React
- Vite
- CSS

## Development Notes

- Component banate waqt functional components aur hooks (useState, useEffect) ka istemal karein.
- Styling ke liye CSS modules ya scoped styles adopt karna recommended hai.
- Linting aur format rules agar configured hain to `npm run lint` / `npm run format` chalayein.

## Contributing

Agar aap contribute karna chahte hain:
1. Fork karo aur feature branch banao.
2. Changes push karo aur pull request bhejo with clear description.
3. Tests aur linter pass hone chahiye (agar configured ho).

## License

Is project ki license ka zikr yahan karein. Agar license nahi diya gaya toh by-default add karne se pehle confirm karen.

---

Agar aap chahte hain ki README mein project-specific screenshots, install guide (yarn/pnpm), environment variable instructions, ya live demo link add karun toh bata dein — main woh details add kar dunga.