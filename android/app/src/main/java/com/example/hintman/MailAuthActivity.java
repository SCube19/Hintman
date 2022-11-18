package com.example.hintman;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;

/* Login activity is mainly used for logging users into the proper part of application.
 * It has two text fields that user can fill up, login and password.
 * Login activity also has two buttons, one to login user in, if mail and password are
 * corresponding to that stored in database. The other button is solely used to redirect to
 * Register activity. */
public class MailAuthActivity extends AppCompatActivity {

    private final String TAG = "MailAuthActivity";

    /* View elements */
    private Button goToRegisterButton;
    private Button loginUserButton;
    private EditText etMail;
    private EditText etPass;

    private FirebaseAuth mAuth;

    /* bundle used in storing elements */
    Bundle bundle = new Bundle();

    /* lifecycle functions */

    /* Initialize view objects and firebase database, create button listeners */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mail_auth);

        goToRegisterButton = (Button) findViewById(R.id.register_activity_button);
        goToRegisterButton.setOnClickListener(v -> openRegisterActivity());
        loginUserButton = (Button) findViewById(R.id.login_button);
        loginUserButton.setOnClickListener(v -> validateInput());
        etMail = (EditText) findViewById(R.id.email_textfield);
        etPass = (EditText) findViewById(R.id.password_textfield);

        mAuth = FirebaseAuth.getInstance();
    }

    /* Resume previous inputs in text fields */
    protected void onResume() {
        etMail.setText(bundle.getString("etMail"));
        etPass.setText(bundle.getString("etPass"));
        super.onResume();
    }

    /* Saves inputs from text fields */
    protected void onPause() {
        bundle.putString("etMail", etMail.getText().toString());
        bundle.putString("etPass", etPass.getText().toString());
        super.onPause();
    }

    /* Opens register activity */
    public void openRegisterActivity() {
        Intent intent = new Intent(this, MailRegisterActivity.class);
        startActivity(intent);
    }

    /* Checks if there is a registered user with given mail and corresponding password. If yes,
     * pass user info to bundle and go to main activity. If no, print appropriate toast message */
    private void validateInput() {
        String mail = etMail.getText().toString().trim();
        String pass = etPass.getText().toString().trim();

        mAuth.signInWithEmailAndPassword(mail, pass)
                .addOnCompleteListener(this, new OnCompleteListener<AuthResult>() {
                    @Override
                    public void onComplete(@NonNull Task<AuthResult> task) {
                        if (task.isSuccessful()) {
                            // Sign in success, update UI with the signed-in user's information
                            Log.d(TAG, "signInWithEmail:success");
                            FirebaseUser user = mAuth.getCurrentUser();
                            assert user != null;
                            loginUser(user);
                        } else {
                            // If sign in fails, display a message to the user.
                            Log.w(TAG, "signInWithEmail:failure", task.getException());
                            Toast.makeText(MailAuthActivity.this, "Authentication failed",
                                    Toast.LENGTH_SHORT).show();
                        }
                    }
                });
    }

    /* Performs basic setup before moving on to Main Activity */
    private void loginUser(FirebaseUser user) {
        SharedPreferences preferences = getSharedPreferences("autoLogin", MODE_PRIVATE);
        SharedPreferences.Editor editor = preferences.edit();
        editor.putString("isLogged", "true");
        editor.putString("loggedMail", user.getEmail());
        editor.apply();

        Intent intent = new Intent(this, InfoActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
        MailAuthActivity.this.finish();
    }
}