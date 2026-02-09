import path from "path";

export enum PublicRoutes {
  Home = "/",
  About = "/about",
  TechStack = "/tech-stack",
  Contact = "/contact",
  Projects = "/projects",
  Blog = "/blog",
  Experience = "/experience",
  Login = "/admin/login",
}

export enum PrivateRoutes {
  Dashboard = "/admin/dashboard",
  Profile = "/admin/profile",
  Experience = "/admin/experience",
}

export enum Routes {
  // - Update the user's profile information
  UpdateProfile = "/api/auth/update-profile",

  // - Authentication routes
  //   POST  -> login
  //   DELETE -> logout
  Auth = "/api/auth",
  User = "/api/user",
}


export class Site {
  // class field (initially null)
  private _publicRoutes: string[] | null = null;
  private _privateRoutes: string[] | null = null;

  // private method, not accessible outside
  private baseUrl(): string {
    if (typeof window !== "undefined") return window.location.origin;

    return process.env.NEXT_PUBLIC_BASE_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:3000`);
  }

  // public method that appends a path
  public getBaseUrl(path: string): string {
    return `${this.baseUrl()}/${path}`;
  }

  // lazy-loaded public routes
  public getPublicRoutes(): string[] {
    if (!this._publicRoutes) {
      this._publicRoutes = Object.values(PublicRoutes) as string[];
    }

    return this._publicRoutes;
  }

  // lazy-loaded private routes
  public getPrivateRoutes(): string[] {
    if (!this._privateRoutes) {
      this._privateRoutes = Object.values(PrivateRoutes) as string[];
    }

    return this._privateRoutes;
  }

  // Check if a path is a public route
  public isPublic(pathname: string): boolean {
    // special case for admin login
    return this.getPublicRoutes().some((path: String) => {
      if (pathname === PublicRoutes.Login) return false;
      if (pathname === "/") return true;
      return pathname === path;
    });
  }
}

export const site = new Site();
