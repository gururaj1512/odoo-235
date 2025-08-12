package com.project.odoo_235.presentation.screens.FacilatyUser.navigation

import ProfileScreen
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.gestures.ScrollableState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.project.odoo_235.data.datastore.UserSessionManager
import com.project.odoo_235.presentation.screens.AutheScreen.LoginScreen
import com.project.odoo_235.presentation.screens.FacilatyUser.MainScreen.FacilityDashboardScreen
import com.project.odoo_235.presentation.screens.FacilatyUser.create.CreateCourtScreen


@Composable
fun FacityNavHost() {
    val navController = rememberNavController()
    val context = LocalContext.current
    val sessionManager = remember { UserSessionManager(context) }

    NavHost(navController = navController, startDestination = Screen.MainDashBoard.routes) {

        composable(Screen.MainDashBoard.routes) {
            FacilityDashboardScreen(navController)
        }
        composable(Screen.Add.routes) {
            CreateCourtScreen(
                onCourtCreated = {
                    navController.navigate(Screen.MainDashBoard.routes)
                },
                onBackPressed = {
                    navController.navigate(Screen.MainDashBoard.routes)

                }

            )

        }
        composable(Screen.Profile.routes) {
            ProfileScreen(sessionManager){
                navController.navigate(Screen.Login.routes)
            }

        }
        composable(Screen.Login.routes) {
            LoginScreen(navController)
        }


    }


}