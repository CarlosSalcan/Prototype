import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }

  abrirUser() {
    window.open('/user', '_blank');
  }
  
  login(form:NgForm){
    const email= form.value.email
    const psw= form.value.psw
  }

}
