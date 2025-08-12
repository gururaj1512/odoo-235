package com.project.odoo_235.presentation.screens.AutheScreen

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.project.odoo_235.presentation.navigation.Screen
import com.project.odoo_235.ui.theme.AppColors
import com.project.odoo_235.utils.AppUtils

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SignUpScreen(navController: NavController, authViewModel: AuthViewModel) {
    val context: Context = LocalContext.current
    val scrollState = rememberScrollState()

    var name by remember { mutableStateOf("") }
    var age by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var role by remember { mutableStateOf("User") }
    var otp by remember { mutableStateOf("") }

    val roles = listOf(
        "User" to "👤",
        "FacilityOwner" to "🏛️",
        "Admin" to "⚖️"
    )

    var expanded by remember { mutableStateOf(false) }
    var emailVerified by remember { mutableStateOf(false) }
    var otpSent by remember { mutableStateOf(false) }
    var passwordVisible by remember { mutableStateOf(false) }

    val loading by authViewModel.loading
    val signupSuccess by authViewModel.successSignup
    val signupMessage by authViewModel.signUpMessage
    val keyboardController = LocalSoftwareKeyboardController.current

    LaunchedEffect(signupSuccess) {
        if (signupSuccess) {
            navController.navigate(Screen.Login.routes) {
                popUpTo(Screen.SignUp.routes) { inclusive = true }
            }
        }
    }

    signupMessage?.let {
        AppUtils.showToast(context, it)
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        AppColors.GradientStart.copy(alpha = 0.1f),
                        AppColors.Background
                    )
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // Header Section
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(bottom = 32.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(
                            brush = Brush.linearGradient(
                                colors = listOf(AppColors.Primary, AppColors.PrimaryVariant)
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "⚖️",
                        fontSize = 24.sp,
                        color = AppColors.OnPrimary
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "Create Account",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = AppColors.OnBackground
                )

                Text(
                    text = "Join the QuickCourt community",
                    fontSize = 14.sp,
                    color = AppColors.OnSurfaceVariant,
                    textAlign = TextAlign.Center
                )
            }

            // Email Verification Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = AppColors.Surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Email Section Header
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(
                            imageVector = if (emailVerified) Icons.Outlined.CheckCircle else Icons.Outlined.Email,
                            contentDescription = null,
                            tint = if (emailVerified) AppColors.Success else AppColors.Primary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (emailVerified) "Email Verified ✓" else "Email Verification",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (emailVerified) AppColors.Success else AppColors.OnSurface
                        )
                    }

                    // Email Field
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email Address") },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Outlined.Email,
                                contentDescription = "Email",
                                tint = AppColors.Primary
                            )
                        },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !emailVerified,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AppColors.Primary,
                            focusedLabelColor = AppColors.Primary,
                            cursorColor = AppColors.Primary
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )

                    // OTP Section
                    if (!otpSent && !emailVerified) {
                        Button(
                            onClick = {
                                if (email.isNotBlank()) {
                                    authViewModel.sendOtpToEmail(
                                        email,
                                        onSuccess = {
                                            otpSent = true
                                            AppUtils.showToast(context, "OTP sent to your email")
                                        },
                                        onError = { AppUtils.showToast(context, it) }
                                    )
                                } else {
                                    AppUtils.showToast(context, "Please enter email first")
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = AppColors.Primary),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Send OTP", color = AppColors.OnPrimary)
                        }
                    } else if (otpSent && !emailVerified) {
                        OutlinedTextField(
                            value = otp,
                            onValueChange = { otp = it },
                            label = { Text("Enter OTP") },
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Outlined.Security,
                                    contentDescription = "OTP",
                                    tint = AppColors.Primary
                                )
                            },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = AppColors.Primary,
                                focusedLabelColor = AppColors.Primary,
                                cursorColor = AppColors.Primary
                            ),
                            shape = RoundedCornerShape(12.dp)
                        )

                        Button(
                            onClick = {
                                authViewModel.verifyEmailOtp(
                                    email,
                                    otp,
                                    onSuccess = {
                                        emailVerified = true
                                        AppUtils.showToast(context, "Email verified successfully!")
                                    },
                                    onError = { AppUtils.showToast(context, it) }
                                )
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = AppColors.Success),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Verify OTP", color = AppColors.OnPrimary)
                        }
                    }
                }
            }

            // Registration Form (only shown after email verification)
            if (emailVerified) {
                Spacer(modifier = Modifier.height(16.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = AppColors.Surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Text(
                            text = "Complete Your Profile",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = AppColors.OnSurface
                        )

                        // Full Name
                        OutlinedTextField(
                            value = name,
                            onValueChange = { name = it },
                            label = { Text("Full Name") },
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Outlined.Person,
                                    contentDescription = "Name",
                                    tint = AppColors.Primary
                                )
                            },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = AppColors.Primary,
                                focusedLabelColor = AppColors.Primary,
                                cursorColor = AppColors.Primary
                            ),
                            shape = RoundedCornerShape(12.dp)
                        )

                        // Password
                        OutlinedTextField(
                            value = password,
                            onValueChange = { password = it },
                            label = { Text("Password") },
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Outlined.Lock,
                                    contentDescription = "Password",
                                    tint = AppColors.Primary
                                )
                            },
                            trailingIcon = {
                                IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                    Icon(
                                        imageVector = if (passwordVisible) Icons.Outlined.Visibility else Icons.Outlined.VisibilityOff,
                                        contentDescription = if (passwordVisible) "Hide password" else "Show password",
                                        tint = AppColors.OnSurfaceVariant
                                    )
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = AppColors.Primary,
                                focusedLabelColor = AppColors.Primary,
                                cursorColor = AppColors.Primary
                            ),
                            shape = RoundedCornerShape(12.dp)
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Phone
                            OutlinedTextField(
                                value = phone,
                                onValueChange = { phone = it },
                                label = { Text("Phone") },
                                leadingIcon = {
                                    Icon(
                                        imageVector = Icons.Outlined.Phone,
                                        contentDescription = "Phone",
                                        tint = AppColors.Primary
                                    )
                                },
                                modifier = Modifier.weight(1f),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                                singleLine = true,
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = AppColors.Primary,
                                    focusedLabelColor = AppColors.Primary,
                                    cursorColor = AppColors.Primary
                                ),
                                shape = RoundedCornerShape(12.dp)
                            )

                            // Age
                            OutlinedTextField(
                                value = age,
                                onValueChange = { age = it },
                                label = { Text("Age") },
                                modifier = Modifier.weight(0.6f),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                singleLine = true,
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = AppColors.Primary,
                                    focusedLabelColor = AppColors.Primary,
                                    cursorColor = AppColors.Primary
                                ),
                                shape = RoundedCornerShape(12.dp)
                            )
                        }

                        // Role Dropdown
                        ExposedDropdownMenuBox(
                            expanded = expanded,
                            onExpandedChange = { expanded = !expanded }
                        ) {
                            OutlinedTextField(
                                value = "${roles.find { it.first == role }?.second ?: "👤"} $role",
                                onValueChange = { },
                                label = { Text("Select Role") },
                                readOnly = true,
                                trailingIcon = {
                                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded)
                                },
                                modifier = Modifier
                                    .menuAnchor()
                                    .fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = AppColors.Primary,
                                    focusedLabelColor = AppColors.Primary,
                                    cursorColor = AppColors.Primary
                                ),
                                shape = RoundedCornerShape(12.dp)
                            )

                            ExposedDropdownMenu(
                                expanded = expanded,
                                onDismissRequest = { expanded = false }
                            ) {
                                roles.forEach { (roleName, emoji) ->
                                    DropdownMenuItem(
                                        text = {
                                            Row(
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Text(emoji, fontSize = 18.sp)
                                                Spacer(modifier = Modifier.width(8.dp))
                                                Column {
                                                    Text(roleName, fontWeight = FontWeight.Medium)
                                                    Text(
                                                        text = when(roleName) {
                                                            "User" -> "Book facilities & join cases"
                                                            "FacilityOwner" -> "Manage courts & facilities"
                                                            "Admin" -> "System administration"
                                                            else -> ""
                                                        },
                                                        fontSize = 12.sp,
                                                        color = AppColors.OnSurfaceVariant
                                                    )
                                                }
                                            }
                                        },
                                        onClick = {
                                            role = roleName
                                            expanded = false
                                        }
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Sign Up Button
                        Button(
                            onClick = {
                                keyboardController?.hide()
                                authViewModel.signup(
                                    name,
                                    age.toIntOrNull() ?: 0,
                                    email,
                                    phone,
                                    role,
                                    password
                                )
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp),
                            enabled = !loading && name.isNotBlank() && password.isNotBlank() && phone.isNotBlank(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = AppColors.Primary,
                                disabledContainerColor = AppColors.Primary.copy(alpha = 0.6f)
                            ),
                            shape = RoundedCornerShape(12.dp),
                            elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
                        ) {
                            if (loading) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    color = AppColors.OnPrimary,
                                    strokeWidth = 2.dp
                                )
                            } else {
                                Text(
                                    "Create Account",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = AppColors.OnPrimary
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Login Link
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Already have an account? ",
                    color = AppColors.OnSurfaceVariant,
                    fontSize = 14.sp
                )
                Text(
                    text = "Sign In",
                    color = AppColors.Primary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.clickable {
                        navController.navigate(Screen.Login.routes)
                    }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}