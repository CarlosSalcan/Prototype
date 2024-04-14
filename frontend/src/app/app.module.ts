import { NgModule } from "@angular/core";
import { UserComponent } from "./user/user.component";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";

@NgModule({
    declarations: [
        AppComponent,
        UserComponent,
        LoginComponent
    ],
    imports: [
        BrowserModule,
        FormsModule
    ]
})

export class AppModule { }