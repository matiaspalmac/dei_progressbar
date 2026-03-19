-- Read theme from dei_hud KVP (shared ecosystem preferences)
local function getSharedTheme()
    local raw = GetResourceKvpString('dei_hud_prefs')
    if raw and raw ~= '' then
        local prefs = json.decode(raw)
        return prefs and prefs.theme or 'dark', prefs and prefs.lightMode or false
    end
    return 'dark', false
end

-- Apply current ecosystem theme
function SyncTheme()
    local theme, lightMode = getSharedTheme()
    SendNUIMessage({ action = 'setTheme', theme = theme, lightMode = lightMode })
end

-- Sync theme on startup
CreateThread(function()
    Wait(1500)
    SyncTheme()
end)

-- Listen for instant theme sync from dei_hud ecosystem
RegisterNetEvent('dei:themeChanged', function(theme, lightMode)
    SendNUIMessage({ action = 'setTheme', theme = theme, lightMode = lightMode })
end)
