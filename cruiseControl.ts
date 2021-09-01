// >> Imports
import * as alt from 'alt-client';
import * as native from 'natives';

import { KeybindController } from '../../../client/events/keyup';
import { InputView } from '../../../client/views/input';
import { KEY_BINDS } from "../../../shared/enums/keybinds";
import { SYSTEM_EVENTS } from "../../../shared/enums/system";
import { InputOptionType, InputResult } from '../../../shared/interfaces/InputMenus';

// Feel free to change all the stuff here
const cruiseControlTitle = 'Tempomat';
const cruiseControlDescription = 'Hier kannst du eingeben, wie schnell dein Fahrzeug fahren soll. 50-300 KM/H';
const speedPlaceholder = '50';
const errorDescription = 'Fehler bei der Ausführung [01].';

alt.onServer(SYSTEM_EVENTS.TICKS_START, init);
function init() {
    KeybindController.registerKeybind({ key: KEY_BINDS.CRUISECONTROL, singlePress: showCruiseControl });
}

function showCruiseControl() {
    if (!alt.Player.local.vehicle || native.getEntitySpeed(alt.Player.local.vehicle.scriptID) > 0) return;
    if (alt.Player.local.vehicle && alt.Player.local.seat == 1) {
        const InputMenu = {
            title: cruiseControlTitle,
            options: [
                {
                    id: 'CruiseControl',
                    desc: cruiseControlDescription,
                    placeholder: speedPlaceholder,
                    type: InputOptionType.NUMBER,
                    error: errorDescription
                }
            ],
            callback: (results: InputResult[]) => {
                if (results.length <= 0) {
                    InputView.show(InputMenu);
                    return;
                }

                const data = results.find((x) => x && x.id === 'CruiseControl');
                if (!data) {
                    InputView.show(InputMenu);
                    return;
                }
                alt.emit('cruiseControl:SetSpeed', data.value);
            }
        }
        InputView.show(InputMenu);
    }
}

alt.on('cruiseControl:SetSpeed', (speed: number) => {
    if (speed < 0 || speed > 300) return;
    if (speed == 0) {
        alt.Player.local.setMeta("cruisecontrol", false);
        native.setVehicleMaxSpeed(alt.Player.local.vehicle.scriptID, 0);
        native.setEntityMaxSpeed(alt.Player.local.vehicle.scriptID, 0);
    } else if (speed != 0) {
        alt.Player.local.setMeta("cruisecontrol", true);
        native.setVehicleMaxSpeed(alt.Player.local.vehicle.scriptID, speed * 0.278);
        native.setEntityMaxSpeed(alt.Player.local.vehicle.scriptID, speed * 0.278);
    }
});