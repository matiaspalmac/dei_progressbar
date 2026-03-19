ProgressActive = false
local progressPromise = nil
local currentProp = nil
local currentAnim = nil
local frozenPed = false

-----------------------------------------------------------
-- INTERNAL HELPERS
-----------------------------------------------------------

local function cleanupAnim()
    if currentAnim then
        local ped = PlayerPedId()
        ClearPedTasks(ped)
        currentAnim = nil
    end
end

local function cleanupProp()
    if currentProp and DoesEntityExist(currentProp) then
        DeleteEntity(currentProp)
        currentProp = nil
    end
end

local function cleanupFreeze()
    if frozenPed then
        FreezeEntityPosition(PlayerPedId(), false)
        frozenPed = false
    end
end

local function cleanup()
    cleanupAnim()
    cleanupProp()
    cleanupFreeze()
end

local function FinishProgress(completed)
    if not ProgressActive then return end
    ProgressActive = false
    cleanup()
    SendNUIMessage({ action = 'hide' })
    if progressPromise then
        local p = progressPromise
        progressPromise = nil
        p:resolve(completed)
    end
end

local function setupAnim(options)
    if not options or not options.anim then return end
    local dict = options.anim.dict
    local clip = options.anim.clip
    if not dict or not clip then return end

    local ped = PlayerPedId()
    RequestAnimDict(dict)
    local timeout = 0
    while not HasAnimDictLoaded(dict) and timeout < 5000 do
        Wait(10)
        timeout = timeout + 10
    end
    if HasAnimDictLoaded(dict) then
        TaskPlayAnim(ped, dict, clip, 8.0, -8.0, -1, (options.anim.flag or 49), 0, false, false, false)
        currentAnim = { dict = dict, clip = clip }
    end
end

local function setupProp(options)
    if not options or not options.prop then return end
    local model = options.prop.model
    if not model then return end

    local hash = type(model) == 'string' and joaat(model) or model
    RequestModel(hash)
    local timeout = 0
    while not HasModelLoaded(hash) and timeout < 5000 do
        Wait(10)
        timeout = timeout + 10
    end
    if not HasModelLoaded(hash) then return end

    local ped = PlayerPedId()
    local bone = GetPedBoneIndex(ped, options.prop.bone or 57005)
    local offset = options.prop.offset or vector3(0.0, 0.0, 0.0)
    local rot = options.prop.rot or vector3(0.0, 0.0, 0.0)

    local prop = CreateObject(hash, 0.0, 0.0, 0.0, true, true, true)
    AttachEntityToEntity(prop, ped, bone,
        offset.x, offset.y, offset.z,
        rot.x, rot.y, rot.z,
        true, true, false, true, 1, true
    )
    SetModelAsNoLongerNeeded(hash)
    currentProp = prop
end

local function setupFreeze(options)
    if options and options.freeze == true or (options and options.freeze == nil and Config.FreezeDefault) then
        FreezeEntityPosition(PlayerPedId(), true)
        frozenPed = true
    end
end

-----------------------------------------------------------
-- DISABLE ACTIONS THREAD
-----------------------------------------------------------

local function startDisableThread(options)
    local disable = options and options.disableActions
    if disable == nil then disable = Config.DisableActionsDefault end
    if not disable then return end

    CreateThread(function()
        while ProgressActive do
            DisableControlAction(0, 24, true)   -- attack
            DisableControlAction(0, 25, true)   -- aim
            DisableControlAction(0, 47, true)   -- weapon
            DisableControlAction(0, 58, true)   -- weapon
            DisableControlAction(0, 263, true)  -- melee
            DisableControlAction(0, 264, true)  -- melee
            DisableControlAction(0, 257, true)  -- melee
            DisableControlAction(0, 140, true)  -- melee
            DisableControlAction(0, 141, true)  -- melee
            DisableControlAction(0, 142, true)  -- melee
            DisableControlAction(0, 143, true)  -- melee
            DisableControlAction(0, 21, true)   -- sprint
            DisableControlAction(0, 22, true)   -- jump
            DisableControlAction(0, 36, true)   -- stealth
            DisableControlAction(0, 44, true)   -- cover
            Wait(0)
        end
    end)
end

-----------------------------------------------------------
-- CANCEL THREAD
-----------------------------------------------------------

local function startCancelThread(canCancel, cancelKey)
    if not canCancel then return end
    local control = Config.CancelControl

    CreateThread(function()
        while ProgressActive do
            if IsControlJustPressed(0, control) then
                FinishProgress(false)
                return
            end
            Wait(0)
        end
    end)
end

-----------------------------------------------------------
-- CORE START FUNCTION
-----------------------------------------------------------

local function startProgress(style, duration, label, options)
    if ProgressActive then return false end

    options = options or {}
    ProgressActive = true

    local p = promise.new()
    progressPromise = p

    local color = options.color or Config.DefaultColor
    local canCancel = options.canCancel
    if canCancel == nil then
        canCancel = (style == 'linear')
    end

    -- Send to NUI
    SendNUIMessage({
        action = 'start',
        style = style,
        duration = duration,
        label = label,
        color = color,
        canCancel = canCancel,
        cancelText = Config.ShowCancelText and Config.CancelText or nil,
        icon = options.icon or nil,
    })

    -- Setup gameplay systems
    setupAnim(options)
    setupProp(options)
    setupFreeze(options)
    startDisableThread(options)
    startCancelThread(canCancel, options.cancelKey or Config.CancelKey)

    -- Wait for result
    local result = Citizen.Await(p)
    return result
end

-----------------------------------------------------------
-- EXPORTS
-----------------------------------------------------------

function Linear(duration, label, options)
    return startProgress('linear', duration, label, options)
end

function Circular(duration, label, options)
    return startProgress('circular', duration, label, options)
end

function Mini(duration, label, options)
    return startProgress('mini', duration, label, options)
end

function Semicircle(duration, label, options)
    return startProgress('semicircle', duration, label, options)
end

function Cancel()
    if ProgressActive then
        FinishProgress(false)
    end
end

function IsActive()
    return ProgressActive
end

-- ============================================================
-- Dei Ecosystem - Startup
-- ============================================================
-- Cleanup on resource stop
AddEventHandler('onResourceStop', function(res)
    if res ~= GetCurrentResourceName() then return end
    SetNuiFocus(false, false)
    local ped = PlayerPedId()
    FreezeEntityPosition(ped, false)
    ClearPedTasks(ped)
    if currentProp and DoesEntityExist(currentProp) then
        DeleteEntity(currentProp)
    end
end)

