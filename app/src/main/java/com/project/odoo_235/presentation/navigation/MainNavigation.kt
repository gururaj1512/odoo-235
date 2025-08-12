package com.project.odoo_235.presentation.navigation


import ProfileScreen
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.project.odoo_235.data.datastore.UserSessionManager

import com.project.odoo_235.presentation.screens.AutheScreen.AuthViewModel
import com.project.odoo_235.presentation.screens.AutheScreen.LoginScreen
import com.project.odoo_235.presentation.screens.AutheScreen.SignUpScreen
import com.project.odoo_235.presentation.screens.FacilatyUser.navigation.FacityNavHost
import com.project.odoo_235.presentation.screens.MianScreen.HomeScreen
import com.project.odoo_235.presentation.screens.MianScreen.MainViewModel
import com.project.odoo_235.presentation.screens.StartScreen.OnboardingScreen1
import com.project.odoo_235.presentation.screens.StartScreen.OnboardingScreen2
import com.project.odoo_235.presentation.screens.StartScreen.OnboardingScreen3
import com.project.odoo_235.presentation.screens.StartScreen.SplashScreen

import com.project.odoo_235.presentation.screens.bookingScreen.BookingSuccessScreen
import com.project.odoo_235.presentation.screens.bookingScreen.BookingViewModel
import com.project.odoo_235.presentation.screens.bookingScreen.VenueScreen

import com.project.odoo_235.presentation.screens.chatbot.ChatBotScreen
import com.project.odoo_235.presentation.screens.googlemapscreen.MapScreen

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun MainNavigation(navController: NavHostController) {
    val context = LocalContext.current
    val sessionManager = remember { UserSessionManager(context) }
    val mainViewModel: MainViewModel = viewModel()

    val authViewModel: AuthViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return AuthViewModel(sessionManager) as T
            }
        }
    )
    val bookingViewModel : BookingViewModel = viewModel()

    NavHost(navController = navController, startDestination = Screen.SplashScreen.routes) {
        composable(Screen.SplashScreen.routes) {
            SplashScreen(navController = navController, authViewModel = authViewModel)
        }
        composable(Screen.Navigation.routes) {
            FacityNavHost()
        }
        composable(Screen.WelcomeScreen1.routes) {
            OnboardingScreen1(navController)
        }
        composable("Onboarding2") { OnboardingScreen2(navController) }
        composable("Onboarding3") { OnboardingScreen3(navController) }

        composable(Screen.SignUp.routes) {
            SignUpScreen(navController = navController, authViewModel = authViewModel)
        }
        composable(Screen.Login.routes) {
            LoginScreen(navController = navController)
        }
        composable(Screen.MainDashBoard.routes) {
            HomeScreen(navController, mainViewModel)
        }
        composable(Screen.search.routes) {
            MapScreen(navController)
        }



        composable(
            route = Screen.BookingScreen.routes,
            arguments = listOf(navArgument("bookingId") { type = NavType.StringType })
        ) { backStackEntry ->
            val bookingId = backStackEntry.arguments?.getString("bookingId") ?: ""
            VenueScreen(
                venueId = bookingId,
                bookingViewModel,
                onNavigateToSuccess = {
                    navController.navigate(Screen.bookingSucess.routes) {
                        popUpTo(Screen.BookingScreen.bookingScreen(bookingId)) { inclusive = true }
                    }
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }



        composable(Screen.bookingSucess.routes) {

            BookingSuccessScreen(
                bookingViewModel,
                onGoHome = {
                    navController.navigate(Screen.MainDashBoard.routes) {
                        popUpTo(Screen.MainDashBoard.routes) { inclusive = true }
                    }
                },
                onViewReceipt = {

                }
            )
        }

        composable(route = "profile") {
            ProfileScreen(
                userSessionManager = sessionManager,
                onLogoutSuccess = {
                    // Navigate to login or welcome screen after logout
                    navController.navigate(Screen.Login.routes) {
                        popUpTo(0) { inclusive = true } // Clear backstack
                    }
                }
            )
        }

        composable(route = "bot") {
            ChatBotScreen(navController)
        }
    }
}
