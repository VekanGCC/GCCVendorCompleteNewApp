import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LucideAngularModule, Home, LogOut, User, Bell, Plus, Users, Briefcase, TrendingUp, CheckCircle, XCircle, Clock, Eye, MessageSquare, Mail, Lock, LogIn, Loader, Minus, X, Check, Search, MoreHorizontal, AlertTriangle, ChevronDown, RotateCcw, ArrowRight, ArrowLeft, UserPlus, Package, Target, Shield, BarChart, Twitter, Linkedin, Github, Activity, Info, HelpCircle } from 'lucide-angular';

import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    importProvidersFrom(
      ReactiveFormsModule,
      FormsModule,
      LucideAngularModule.pick({
        Home,
        LogOut,
        User,
        Bell,
        Plus,
        Users,
        Briefcase,
        TrendingUp,
        CheckCircle,
        XCircle,
        Clock,
        Eye,
        MessageSquare,
        Mail,
        Lock,
        LogIn,
        Loader,
        Minus,
        X,
        Check,
        Search,
        MoreHorizontal,
        AlertTriangle,
        ChevronDown,
        RotateCcw,
        ArrowRight,
        ArrowLeft,
        UserPlus,
        Package,
        Target,
        Shield,
        BarChart,
        Twitter,
        Linkedin,
        Github,
        Activity,
        Info,
        HelpCircle
      })
    )
  ]
};