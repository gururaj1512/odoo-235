package com.project.odoo_235

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.project.odoo_235.presentation.navigation.MainNavigation
import com.project.odoo_235.ui.theme.Odoo_235Theme

@Composable
fun QuickCourt() {
    Odoo_235Theme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            MainNavigation(navController = rememberNavController())
        }
    }
}