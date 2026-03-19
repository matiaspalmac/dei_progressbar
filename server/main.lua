-- ============================================================
-- Dei Ecosystem - Server Startup
-- ============================================================
CreateThread(function()
    Wait(500)
    local v = GetResourceMetadata(GetCurrentResourceName(), 'version', 0) or '1.0'
    print('^4[Dei]^0 dei_progressbar v' .. v .. ' - ^2Iniciado^0')
end)
