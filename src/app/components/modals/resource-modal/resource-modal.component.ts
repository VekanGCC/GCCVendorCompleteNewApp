import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AppService } from '../../../services/app.service';
import { AdminService } from '../../../services/admin.service';
import { AdminSkill } from '../../../models/admin.model';

@Component({
  selector: 'app-resource-modal',
  templateUrl: './resource-modal.component.html',
  styleUrls: ['./resource-modal.component.css']
})
export class ResourceModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  resourceForm: FormGroup;
  availableSkills: AdminSkill[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private appService: AppService,
    private adminService: AdminService
  ) {
    this.resourceForm = this.fb.group({
      name: ['', Validators.required],
      skills: this.fb.array([this.fb.control('', Validators.required)]),
      experience: [1, [Validators.required, Validators.min(0), Validators.max(50)]],
      location: ['', Validators.required],
      availability: ['available', Validators.required],
      rate: [50, [Validators.required, Validators.min(1), Validators.max(500)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    // Load available skills from admin service
    this.adminService.adminSkills$.subscribe(skills => {
      this.availableSkills = skills.filter(skill => skill.isActive);
    });
  }

  get skills(): FormArray {
    return this.resourceForm.get('skills') as FormArray;
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
    if (this.resourceForm.valid) {
      const user = this.authService.currentUser;
      if (!user) return;

      const formValue = this.resourceForm.value;
      const filteredSkills = formValue.skills.filter((skill: string) => skill.trim() !== '');

      if (filteredSkills.length === 0) return;

      this.appService.addResource({
        ...formValue,
        skills: filteredSkills,
        vendorId: user.id,
        vendorName: user.company
      });

      this.close.emit();
    }
  }

  onClose(): void {
    this.close.emit();
  }
}