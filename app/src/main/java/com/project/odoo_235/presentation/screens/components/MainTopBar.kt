package com.project.odoo_235.presentation.screens.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.project.odoo_235.presentation.navigation.Screen
import com.project.odoo_235.ui.theme.AppColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickCourtTopBar(
    currentLocation: String = "Mumbai",
    onProfileClick: () -> Unit,
    onLocationClick: () -> Unit
) {
    TopAppBar(
        title = {
            Column {
                Text(
                    text = "QuickCourt",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = AppColors.OnPrimary
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.clickable { onLocationClick() }
                ) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = "Location",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = currentLocation,
                        fontSize = 14.sp,
                        color = Color.White
                    )
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = AppColors.Primary
        ),
        actions = {
            IconButton(onClick = onProfileClick) {
                Icon(
                    imageVector = Icons.Default.AccountCircle,
                    contentDescription = "Profile",
                    tint = Color.White
                )
            }
        }
    )
}

// ---------- BOTTOM NAV BAR ----------
sealed class BottomNavItem(val title: String, val icon: ImageVector, val route: String) {
    object Home : BottomNavItem("Home", Icons.Default.Home, Screen.MainDashBoard.routes)
    object Explore : BottomNavItem("Explore", Icons.Default.Search, Screen.search.routes)
    object ChatBot : BottomNavItem("AI", Icons.Default.CalendarToday, "bot")
    object Profile : BottomNavItem("Profile", Icons.Default.Person, Screen.Profile.routes)
}
