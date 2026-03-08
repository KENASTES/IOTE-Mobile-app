#include <iostream>
#include <vector>
#include <cmath>
#include <cstdlib>
#ifdef __EMSCRIPTEN__
    #include <emscripten.h>
    #else
    #define EMSCRIPTEN_KEEPALIVE
#endif

extern "C" {
    EMSCRIPTEN_KEEPALIVE
    float Cosine_Similarity_Check(float* vector_A, float* vector_B, int size) {
        float dot_product = 0.0f;
        float magnitude_A = 0.0f;
        float magnitude_B = 0.0f;

        for (int i = 0; i < size; ++i) {
            dot_product += vector_A[i] * vector_B[i];
            magnitude_A += vector_A[i] * vector_A[i];
            magnitude_B += vector_B[i] * vector_B[i];
        }

        magnitude_A = std::sqrt(magnitude_A);
        magnitude_B = std::sqrt(magnitude_B);

        if (magnitude_A == 0.0f || magnitude_B == 0.0f) {
            return 0.0f;
        }

        return dot_product / (magnitude_A * magnitude_B);
    }

    EMSCRIPTEN_KEEPALIVE
    void* Wasm_malloc(size_t size) {
        return std::malloc(size);
    }

    EMSCRIPTEN_KEEPALIVE
    void Wasm_free(void* ptr) {
        std::free(ptr);
    }
}