import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-add-admin-skill-modal',
  templateUrl: './add-admin-skill-modal.component.html',
  styleUrls: ['./add-admin-skill-modal.component.css']
})
export class AddAdminSkillModalComponent {
  @Output() close = new EventEmitter<void>();

  skillForm: FormGroup;
  isLoading = false;
  error = '';

  skillCategories: string[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private adminService: AdminService
  ) {
    this.skillCategories = this.adminService.getSkillCategories();
    
    this.skillForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', Validators.required],
      description: [''],
      isActive: [true]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.skillForm.valid) {
      this.isLoading = true;
      this.error = '';

      try {
        const user = this.authService.currentUser;
        if (!user) return;

        const formValue = this.skillForm.value;

        await this.adminService.addAdminSkill({
          ...formValue,
          createdBy: user.name
        });

        this.close.emit();
      } catch (error) {
        console.error('Error adding skill:', error);
        this.error = 'Failed to add skill. Please try again.';
      } finally {
        this.isLoading = false;
      }
    }
  }

  onClose(): void {
    this.close.emit();
  }

  getFieldError(fieldName: string): string {
    const field = this.skillForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Skill Name',
      category: 'Category',
      description: 'Description'
    };
    return labels[fieldName] || fieldName;
  }
}