import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import { AppService } from '../../../services/app.service';
import { AdminService } from '../../../services/admin.service';
import { AdminSkill } from '../../../models/admin.model';

@Component({
  selector: 'app-requirement-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './requirement-modal.component.html',
  styleUrls: ['./requirement-modal.component.css']
})
export class RequirementModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  requirementForm: FormGroup;
  availableSkills: AdminSkill[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private appService: AppService,
    private adminService: AdminService
  ) {
    this.requirementForm = this.fb.group({
      title: ['', Validators.required],
      skills: this.fb.array([this.fb.control('', Validators.required)]),
      experience: [1, [Validators.required, Validators.min(0), Validators.max(50)]],
      location: ['', Validators.required],
      duration: ['', Validators.required],
      budget: [50, [Validators.required, Validators.min(1), Validators.max(500)]],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load available skills from admin service
    this.adminService.adminSkills$.subscribe(skills => {
      this.availableSkills = skills.filter(skill => skill.isActive);
    });
  }

  get skills(): FormArray {
    return this.requirementForm.get('skills') as FormArray;
  }

  addSkill(): void {
    this.skills.push(this.fb.control('', Validators.required));
  }

  removeSkill(index: number): void {
    if (this.skills.length > 1) {
      this.skills.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.requirementForm.valid) {
      const user = this.authService.currentUser;
      if (!user) return;

      const formValue = this.requirementForm.value;
      const filteredSkills = formValue.skills.filter((skill: string) => skill.trim() !== '');

      if (filteredSkills.length === 0) return;

      this.appService.addRequirement({
        ...formValue,
        skills: filteredSkills,
        clientId: user.id,
        clientName: user.company,
        status: 'open' as const
      });

      this.close.emit();
    }
  }

  onClose(): void {
    this.close.emit();
  }
}