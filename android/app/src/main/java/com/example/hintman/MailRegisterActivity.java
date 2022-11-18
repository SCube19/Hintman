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

public class MailRegisterActivity extends AppCompatActivity {

    private final String TAG = "MailRegisterActivity";

    private final int MAIL_IND = 0;
    private final int PASS_IND = 1;
    private final int CONPASS_IND = 2;

    private Button goToLoginButton;
    private Button registerUserButton;
    private final EditText[] ets = new EditText[3];

    /* bundle used in storing elements */
    private final Bundle bundle = new Bundle();

    private FirebaseAuth mAuth;

    /* Initialize view objects */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mail_register);

        goToLoginButton = (Button) findViewById(R.id.login_activity_button);
        goToLoginButton.setOnClickListener(v -> openLoginActivity());
        registerUserButton = (Button) findViewById(R.id.register_button);
        registerUserButton.setOnClickListener(v -> registerUser());
        ets[MAIL_IND] = findViewById(R.id.email_textfield);
        ets[PASS_IND] = findViewById(R.id.password_textfield);
        ets[CONPASS_IND] = findViewById(R.id.confirmpassword_textfield);

        mAuth = FirebaseAuth.getInstance();
    }

    /* Resume previous inputs in textfields */
    protected void onResume() {
        ets[MAIL_IND].setText(bundle.getString("etMail"));
        ets[PASS_IND].setText(bundle.getString("etPass"));
        ets[CONPASS_IND].setText(bundle.getString("etPassConf"));
        super.onResume();
    }

    /* Save inputs from textfields */
    protected void onPause() {
        bundle.putString("etMail", ets[MAIL_IND].getText().toString());
        bundle.putString("etPass", ets[PASS_IND].getText().toString());
        bundle.putString("etPassConf", ets[CONPASS_IND].getText().toString());
        super.onPause();
    }

    /* Button listener functions */

    /* Closes register activity */
    public void openLoginActivity() {
        MailRegisterActivity.this.finish();
    }

    /* Parses texts that user inputted and goes on to validate them */
    public void registerUser() {
        String[] data = new String[3];
        data[MAIL_IND] = ets[MAIL_IND].getText().toString();
        data[PASS_IND] = ets[PASS_IND].getText().toString();
        data[CONPASS_IND] = ets[CONPASS_IND].getText().toString();

        validateInput(data);
    }

    /* Validates if given account is unique and correct, and if given name and surname consists of
     * max 40 letters only and min of 1 letter.  */
    private void validateInput(String[] data) {

        if (!data[PASS_IND].equals(data[CONPASS_IND])) {
            Log.w(TAG, "registerUserWithEmail:failure");
            Toast.makeText(MailRegisterActivity.this, "Passwords are not equal",
                    Toast.LENGTH_SHORT).show();
        }
        mAuth.createUserWithEmailAndPassword(data[MAIL_IND], data[PASS_IND])
                .addOnCompleteListener(this, new OnCompleteListener<AuthResult>() {
                    @Override
                    public void onComplete(@NonNull Task<AuthResult> task) {
                        if (task.isSuccessful()) {
                            // Sign in success, update UI with the signed-in user's information
                            Log.d(TAG, "registerUserWithEmail:success");
                            FirebaseUser user = mAuth.getCurrentUser();
                            assert user != null;
                            loginUser(user);
                        } else {
                            // If sign in fails, display a message to the user.
                            Log.w(TAG, "registerUserWithEmail:failure", task.getException());
                            Toast.makeText(MailRegisterActivity.this, "Authentication failed",
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
        intent.putExtra("logged_mail", user.getEmail());
        startActivity(intent);
        MailRegisterActivity.this.finish();
    }
}