package com.example.fitfi.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.example.fitfi.ui.theme.*

enum class FitFiInputState {
    Default, Focused, Error, Disabled
}

@Composable
fun FitFiInput(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String? = null,
    label: String? = null,
    isError: Boolean = false,
    enabled: Boolean = true,
    singleLine: Boolean = true,
    keyboardType: KeyboardType = KeyboardType.Text,
    imeAction: ImeAction = ImeAction.Default,
    keyboardActions: KeyboardActions = KeyboardActions.Default,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    leadingIcon: (@Composable () -> Unit)? = null,
    trailingIcon: (@Composable () -> Unit)? = null,
    errorMessage: String? = null
) {
    var isFocused by remember { mutableStateOf(false) }
    
    val inputState = when {
        !enabled -> FitFiInputState.Disabled
        isError -> FitFiInputState.Error
        isFocused -> FitFiInputState.Focused
        else -> FitFiInputState.Default
    }

    val (borderColor, backgroundColor) = when (inputState) {
        FitFiInputState.Default -> Pair(FitFiColors.Border, FitFiColors.SurfaceAlt)
        FitFiInputState.Focused -> Pair(FitFiColors.Primary, FitFiColors.SurfaceAlt)
        FitFiInputState.Error -> Pair(FitFiColors.Error, FitFiColors.SurfaceAlt)
        FitFiInputState.Disabled -> Pair(
            FitFiColors.Border.copy(alpha = FitFiOpacities.Disabled),
            FitFiColors.SurfaceAlt.copy(alpha = FitFiOpacities.Disabled)
        )
    }

    Column(modifier = modifier) {
        // Label
        label?.let { labelText ->
            Text(
                text = labelText,
                style = MaterialTheme.typography.labelMedium,
                color = FitFiColors.TextSecondary,
                modifier = Modifier.padding(bottom = FitFiSpacing.xs)
            )
        }

        // Input Field
        BasicTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = FitFiTouchTargets.minimum)
                .onFocusChanged { focusState ->
                    isFocused = focusState.isFocused
                },
            enabled = enabled,
            singleLine = singleLine,
            keyboardOptions = KeyboardOptions(
                keyboardType = keyboardType,
                imeAction = imeAction
            ),
            keyboardActions = keyboardActions,
            visualTransformation = visualTransformation,
            textStyle = MaterialTheme.typography.bodyLarge.copy(
                color = if (enabled) FitFiColors.TextPrimary else FitFiColors.TextMuted
            ),
            cursorBrush = SolidColor(FitFiColors.Primary),
            decorationBox = { innerTextField ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(FitFiRadii.md))
                        .background(backgroundColor)
                        .border(
                            width = 1.dp,
                            color = borderColor,
                            shape = RoundedCornerShape(FitFiRadii.md)
                        )
                        .padding(FitFiSpacing.md),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    leadingIcon?.invoke()
                    
                    Box(
                        modifier = Modifier.weight(1f)
                    ) {
                        if (value.isEmpty() && placeholder != null) {
                            Text(
                                text = placeholder,
                                style = MaterialTheme.typography.bodyLarge,
                                color = FitFiColors.TextMuted
                            )
                        }
                        innerTextField()
                    }
                    
                    trailingIcon?.invoke()
                }
            }
        )

        // Error Message
        if (isError && errorMessage != null) {
            Text(
                text = errorMessage,
                style = MaterialTheme.typography.bodySmall,
                color = FitFiColors.Error,
                modifier = Modifier.padding(top = FitFiSpacing.xs)
            )
        }
    }
}
