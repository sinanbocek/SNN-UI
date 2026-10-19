// Vite'in CSS modülü ve stil dosyası içe aktarmaları için tip tanımları.
declare module "*.module.css" { const classes: Record<string, string>; export default classes; }
declare module "*.css";
declare module "virtual:added-dates" { const dates: Record<string, string>; export default dates; }
