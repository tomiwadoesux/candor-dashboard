/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  experimental: {
    /*
      @phosphor-icons/react ships 3,024 modules and its barrel re-exports all of
      them, so `import { House } from "@phosphor-icons/react"` pulls the whole
      set — nine files in this app do exactly that. Next's default
      optimizePackageImports list covers lucide-react but not Phosphor, so this
      rewrites the barrel imports to deep imports and keeps dev navigation from
      walking thousands of modules on every route and every HMR pass.
    */
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;
