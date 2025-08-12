import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.project.odoo_235.data.datastore.CachedUser
import com.project.odoo_235.data.datastore.UserSessionManager
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@Composable
fun ProfileScreenContainer(navController: NavController, userSessionManager: UserSessionManager) {
    ProfileScreen(
        userSessionManager = userSessionManager,
        onLogoutSuccess = {
            navController.navigate("login") {
                popUpTo(0) { inclusive = true }
            }
        }
    )
}

@Composable
fun ProfileScreen(
    userSessionManager: UserSessionManager,
    onLogoutSuccess: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()

    val userState = produceState<CachedUser?>(initialValue = null, userSessionManager) {
        userSessionManager.userData.collectLatest { value = it }
    }

    val user = userState.value

    // Blue-white gradient background
    val backgroundGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFF2196F3), Color(0xFFE3F2FD))
    )
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(backgroundGradient)
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            if (user == null) {
                CircularProgressIndicator(
                    color = MaterialTheme.colorScheme.primary
                )
            } else {
                // Wrap content inside a Box or Column with maxWidth so it won't stretch full width
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .wrapContentHeight()
                        .padding(16.dp)
                        .widthIn(max = 400.dp)  // limit max width for better centered appearance
                        .background(MaterialTheme.colorScheme.surface, shape = MaterialTheme.shapes.medium)
                        .padding(24.dp)
                ) {
                    ProfileCard(user = user, onLogoutClick = {
                        coroutineScope.launch {
                            userSessionManager.clearUser()
                            onLogoutSuccess()
                        }
                    })
                }
            }
        }
    }

}

@Composable
fun ProfileCard(user: CachedUser, onLogoutClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .wrapContentHeight(),
        shape = RoundedCornerShape(24.dp),
        elevation = CardDefaults.cardElevation(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.95f))
    ) {
        Column(
            modifier = Modifier
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Avatar with initials
            Box(
                modifier = Modifier
                    .size(96.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.8f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = user.name.split(" ").mapNotNull { it.firstOrNull()?.uppercaseChar() }.joinToString(""),
                    style = MaterialTheme.typography.headlineLarge.copy(
                        color = Color.White,
                        fontWeight = FontWeight.ExtraBold
                    )
                )
            }

            Spacer(Modifier.height(16.dp))

            Text(
                text = user.name,
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.primary
            )

            Text(
                text = user.email,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(Modifier.height(24.dp))

            Divider(color = MaterialTheme.colorScheme.primary.copy(alpha = 0.3f), thickness = 1.dp)

            Spacer(Modifier.height(16.dp))

            InfoRow(label = "Name", value = user.name)
            InfoRow(label = "Email", value = user.email)
            InfoRow(label = "Role", value = user.role.takeIf { it.isNotBlank() } ?: "N/A")

            Spacer(Modifier.height(32.dp))

            Button(
                onClick = onLogoutClick,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
            ) {
                Text(text = "Logout", color = MaterialTheme.colorScheme.onError, style = MaterialTheme.typography.titleMedium)
            }
        }
    }
}

@Composable
private fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold), color = MaterialTheme.colorScheme.primary)
        Text(text = value, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
