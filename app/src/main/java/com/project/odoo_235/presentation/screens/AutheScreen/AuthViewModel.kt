package com.project.odoo_235.presentation.screens.AutheScreen

import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.compose.runtime.State
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.project.odoo_235.data.api.RetrofitInstance
import com.project.odoo_235.data.datastore.UserSessionManager
import com.project.odoo_235.data.models.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import org.json.JSONObject

class AuthViewModel(private val sessionManager: UserSessionManager) : ViewModel() {

    private val _loginMessage = mutableStateOf<String?>(null)
    val loginMessage: State<String?> = _loginMessage
    private val _role = mutableStateOf<String?>(null)
    val role: State<String?> = _role
    private val _signUpMessage = mutableStateOf<String?>(null)
    val signUpMessage: State<String?> = _signUpMessage


    private val _user = mutableStateOf<User?>(null)
    val user: State<User?> = _user
    private val _userupdate = mutableStateOf<User?>(null)
    val userupdate: State<User?> = _userupdate

    private val _loading = mutableStateOf(false)
    val loading: State<Boolean> = _loading

    private val _successLogin = mutableStateOf(false)
    val successLogin: State<Boolean> = _successLogin

    private val _successSignup = mutableStateOf(false)
    val successSignup: State<Boolean> = _successSignup

    init {
        autoLogin()
    }

    private fun autoLogin() {
        viewModelScope.launch {
            try {
                val cachedUser = sessionManager.userData.first()
                if (cachedUser != null && cachedUser.name.isNotEmpty() && cachedUser.email.isNotEmpty()) {
                    _user.value = User(name = cachedUser.name, email = cachedUser.email)
                    _successLogin.value = true
                    Log.d("AutoLogin", "✅ Auto-login with saved user: ${cachedUser.name}")
                } else {
                    Log.d("AutoLogin", "❌ No saved session found")
                }
            } catch (e: Exception) {
                Log.e("AutoLogin", "❌ Exception: ${e.localizedMessage}")
            }
        }
    }




    fun login(email: String, password: String) {
        viewModelScope.launch {
            _loading.value = true
            Log.d("Login", "📤 Sending login request for email: $email")

            try {
                val response = RetrofitInstance.api.login(LoginRequest(email, password))
                Log.d("Login", "📥 Response received: code=${response.code()}, body=${response.body()}")

                if (response.isSuccessful && response.body() != null) {
                    val responseBody = response.body()!!

                    if (responseBody.success) {
                        val user = responseBody.user
                        _user.value = user
                        _loginMessage.value = "Welcome, ${user?.name ?: "User"}!"

                        if (user != null) {
                            _role.value=user.role
                            sessionManager.saveUser(user)
                                .also {
                                    _successLogin.value = true
                                }
                        }

                        Log.d("Login", "✅ Login success: user=${user?.name}, token=${responseBody.token}")
                    } else {
                        _loginMessage.value = responseBody.message ?: "Login failed"
                        _successLogin.value = false
                        Log.w("Login", "❌ Login API returned failure: ${responseBody.message}")
                    }

                } else {
                    _loginMessage.value = "Login failed: ${response.message()}"
                    _successLogin.value = false
                    Log.e("Login", "❌ Login failed: ${response.code()} ${response.message()}")
                }

            } catch (e: Exception) {
                _loginMessage.value = "Error: ${e.localizedMessage}"
                _successLogin.value = false
                Log.e("Login", "❌ Exception during login: ${e.localizedMessage}")
            } finally {
                _loading.value = false
            }
        }
    }

    fun logout(onLoggedOut: () -> Unit) {
        viewModelScope.launch {
            sessionManager.clearUser()
            delay(100)
            _user.value = null
            _successLogin.value = false
            Log.d("Logout", "🚪 User logged out and session cleared")
            onLoggedOut()
        }
    }

    fun sendOtpToEmail(email: String, onSuccess: () -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch {
            try {
                val request = OtpRequest(email)
                val response = RetrofitInstance.api.sendOtp(request) // Backend call
                if (response.isSuccessful) onSuccess()
                else onError(response.message() ?: "Failed to send OTP")
            } catch (e: Exception) {
                onError(e.message ?: "OTP send error")
            }
        }
    }

    fun verifyEmailOtp(email: String, otp: String, onSuccess: () -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch {
            try {
                val request = OtpRequest(email , otp)
                val response = RetrofitInstance.api.verifyOtp(request)
                if (response.isSuccessful) onSuccess()
                else onError(response.message() ?: "Invalid OTP")
            } catch (e: Exception) {
                onError(e.message ?: "OTP verification error")
            }
        }
    }


    fun signup(
        name: String,
        age: Int,
        email: String,
        phone: String,
        role: String,
        password: String
    ) {
        viewModelScope.launch {
            _loading.value = true
            Log.d("Signup", "📤 Sending signup request for email: $email")

            try {
                val request = SignUpRequest(name, email, password, age, role, phone)
                val response = RetrofitInstance.api.signup(request)
                Log.d("Signup", "📥 Response received: code=${response.code()}, body=${response.body()}")

                if (response.isSuccessful && response.body() != null) {
                    val responseBody = response.body()!!

                    if (responseBody.success) {
                        Log.d("Signup", "✅ Signup success for user: ${responseBody.user?.name}")
                        _signUpMessage.value = "Welcome, ${responseBody.user?.name}!"
                        _successSignup.value = true
                    } else {
                        _signUpMessage.value = responseBody.message ?: "Signup failed"
                        _successSignup.value = false
                        Log.w("Signup", "❌ Signup failed: ${responseBody.message}")
                    }

                } else {
                    _signUpMessage.value = "Signup failed: ${response.message()}"
                    _successSignup.value = false
                    Log.e("Signup", "❌ Signup HTTP error: ${response.code()} ${response.message()}")
                }

            } catch (e: Exception) {
                _signUpMessage.value = "Error: ${e.localizedMessage}"
                _successSignup.value = false
                Log.e("Signup", "❌ Exception during signup: ${e.localizedMessage}")
            } finally {
                _loading.value = false
            }
        }
    }

    fun resetRole(){
        _role.value=null
    }


}


