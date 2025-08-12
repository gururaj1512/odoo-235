package com.project.odoo_235.data.api

import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitInstance {

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS) // ⏱️ Allow up to 60s to connect
        .readTimeout(60, TimeUnit.SECONDS)    // ⏱️ Allow up to 60s to read response
        .writeTimeout(60, TimeUnit.SECONDS)   // ⏱️ Allow up to 60s to send file
        .build()

    private fun getInstance(): Retrofit {
        return Retrofit.Builder()
            .baseUrl("http://192.168.43.29:5000/") // ✅ Localhost for Android emulator
            .addConverterFactory(GsonConverterFactory.create())
            .client(okHttpClient) // 👈 Use the custom client with timeouts
            .build()
    }

    val api: Repo by lazy {
        getInstance().create(Repo::class.java)
    }
}
