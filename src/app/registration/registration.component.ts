import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  countries: any[] = [];
  usernameTaken = false;
  submissionError: string | null = null;
  submissionSuccess: string | null = null;

  private unavailableUsernames: string[] = [];

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.registrationForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern('^[a-z0-9]*$'),
        ],
      ],
      country: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.fetchCountries();
    this.fetchUnavailableUsernames();
    this.onChanges();
  }

  fetchCountries(): void {
    this.http.get<any[]>('/assets/countries.json').subscribe(
      (data) => {
        this.countries = data;
      },
      (error) => {
        console.error('Error fetching countries', error);
      }
    );
  }

  fetchUnavailableUsernames(): void {
    this.http
      .get<{ unavailableUsernames: string[] }>(
        '/assets/username-availability.json'
      )
      .subscribe(
        (response) => {
          this.unavailableUsernames = response.unavailableUsernames;
        },
        (error) => {
          console.error('Error fetching unavailable usernames', error);
        }
      );
  }

  onChanges(): void {
    this.registrationForm.get('username')?.valueChanges.subscribe((value) => {
      this.checkUsernameAvailability(value);
    });
  }

  checkUsernameAvailability(username: string | null): void {
    if (
      username &&
      this.unavailableUsernames.includes(username.toLowerCase())
    ) {
      this.usernameTaken = true;
    } else {
      this.usernameTaken = false;
    }
  }

  onSubmit(): void {
    if (this.registrationForm.valid && !this.usernameTaken) {
      const userData = this.registrationForm.value;
      this.http.post<any>('/assets/register.json', userData).subscribe(
        (response) => {
          if (response.success) {
            this.submissionSuccess = response.message;
            this.registrationForm.reset();
          }
        },
        (error) => {
          this.submissionError = 'Registration failed. Please try again.';
          console.error('Error during registration', error);
        }
      );
    } else {
      this.submissionError = 'Please correct the errors in the form.';
    }
  }
}
