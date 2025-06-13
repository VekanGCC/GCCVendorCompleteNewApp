import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FeatherModule } from 'angular-feather';
import { 
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
} from 'angular-feather/icons';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { LayoutComponent } from './components/layout/layout.component';
import { VendorDashboardComponent } from './components/vendor-dashboard/vendor-dashboard.component';
import { ClientDashboardComponent } from './components/client-dashboard/client-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ApplicationsViewComponent } from './components/applications-view/applications-view.component';
import { RequirementModalComponent } from './components/modals/requirement-modal/requirement-modal.component';
import { ResourceModalComponent } from './components/modals/resource-modal/resource-modal.component';
import { ApplyResourceModalComponent } from './components/modals/apply-resource-modal/apply-resource-modal.component';
import { AddUserModalComponent } from './components/modals/add-user-modal/add-user-modal.component';
import { AddSkillModalComponent } from './components/modals/add-skill-modal/add-skill-modal.component';
import { AddAdminSkillModalComponent } from './components/modals/add-admin-skill-modal/add-admin-skill-modal.component';

const icons = {
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
};

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    LoginComponent,
    SignupComponent,
    LayoutComponent,
    VendorDashboardComponent,
    ClientDashboardComponent,
    AdminDashboardComponent,
    ApplicationsViewComponent,
    RequirementModalComponent,
    ResourceModalComponent,
    ApplyResourceModalComponent,
    AddUserModalComponent,
    AddSkillModalComponent,
    AddAdminSkillModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FeatherModule.pick(icons)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }