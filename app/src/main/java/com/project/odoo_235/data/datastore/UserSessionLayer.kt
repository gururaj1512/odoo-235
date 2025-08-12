package com.project.odoo_235.data.datastore

import android.content.Context
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import com.project.odoo_235.data.models.User

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

import kotlinx.serialization.encodeToString
import kotlinx.serialization.Serializable

import kotlinx.serialization.json.Json

private val Context.dataStore by preferencesDataStore("user_session")

@Serializable
data class CachedUser(
    val id: String,
    val name: String,
    val email: String,
    val role: String
)


class UserSessionManager(private val context: Context) {

    companion object {
        private val USER_JSON = stringPreferencesKey("user_json")
    }

    val userData: Flow<CachedUser?> = context.dataStore.data.map { preferences ->
        preferences[USER_JSON]?.let {
            try {
                Json.decodeFromString<CachedUser>(it)
            } catch (e: Exception) {
                null
            }
        }
    }

    suspend fun saveUser(user: User) {
        val cached = CachedUser(
            id = user._id,
            name = user.name,
            email = user.email,
            role = user.role

            )
        val json = Json.encodeToString(cached)
        context.dataStore.edit { it[USER_JSON] = json }
    }

    suspend fun clearUser() {
        context.dataStore.edit { it.clear() }
    }
}
