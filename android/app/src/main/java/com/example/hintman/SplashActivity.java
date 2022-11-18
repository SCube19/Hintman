package com.example.hintman;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;

import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        int SPLASH_DISPLAY_LENGTH = 2200;
        new Handler().postDelayed(new Runnable(){
            @Override
            public void run() {
                /* Create an Intent that will start the Menu-Activity. */
                Intent mainIntent;
                SharedPreferences preferences = getSharedPreferences("autoLogin", MODE_PRIVATE);
                String isLogged = preferences.getString("isLogged", "");

                if (isLogged.equals("true")) {
                    mainIntent = new Intent(SplashActivity.this, InfoActivity.class); //TODO change to camera activity
                    mainIntent.putExtra("logged_name", preferences.getString("logged_name", ""));
                    mainIntent.putExtra("logged_surname", preferences.getString("logged_surname", ""));
                    mainIntent.putExtra("logged_mail", preferences.getString("logged_mail", ""));
                } else
                    mainIntent = new Intent(SplashActivity.this, MailAuthActivity.class);

                SplashActivity.this.startActivity(mainIntent);
                SplashActivity.this.finish();
            }
        }, SPLASH_DISPLAY_LENGTH);
    }
}
