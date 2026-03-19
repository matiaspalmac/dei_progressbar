-- Send config to NUI on startup
CreateThread(function()
    Wait(1600)
    SendNUIMessage({
        action = 'setConfig',
        successFlash = Config.SuccessFlash,
        shimmerEffect = Config.ShimmerEffect,
    })
end)

-----------------------------------------------------------
-- NUI CALLBACKS
-----------------------------------------------------------

-- Progress completed naturally
RegisterNUICallback('progressComplete', function(data, cb)
    if ProgressActive then
        FinishProgress(true)
    end
    cb('ok')
end)

-- Progress was cancelled from NUI side (shouldn't happen normally, but safety)
RegisterNUICallback('progressCancelled', function(data, cb)
    if ProgressActive then
        FinishProgress(false)
    end
    cb('ok')
end)
