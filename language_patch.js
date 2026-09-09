(function () {
    'use strict';

    // *****************************************
    // ***** INICIO TRADUCCIONES ******
    // *****************************************
    const translations = {
        en: {
            'copyright_text': 'ADS-B VENEZUELA — Developed by EANSA. <br> <a href="https://github.com/wiedehopf/tar1090" target="_blank" rel="noopener noreferrer" style="color: gray;">tar1090</a>',

            // *** HEAD ***
            'meta_description': 'ADS‑B Venezuela - Air traffic monitoring in Venezuela',

            // *** HIGHLIGHTED_INFOBLOCK ***
            'reg': 'Reg.:',
            'type_code': 'Type code:',
            'route': 'Route:',
            'route_tooltip': 'Reported flight origin and destination according to adsb.lol',
            'altitude': 'Altitude:',
            'speed': 'Speed:',
            'source': 'Source:',
            'rssi': 'RSSI:',
            'n/a': 'n/a',

            // *** SELECTED_INFOBLOCK ***

            'copy_link': 'Copy Link',
            'copied': 'Copied',
            'copy_link_tooltip': 'Copy share link to clipboard',

            'no_callsign': 'No callsign',

            // *** highlightedTitle infoBlockSection ***
            'mark_as_notable': 'Mark as notable',
            'remove_from_notable': 'Remove from notable',
            'minimize_infoblock': 'Minimize infoblock',
            'restore_infoblock': 'Restore infoblock',
            'close': 'Close',
            'callsign_tooltip': 'Typically the air traffic control callsign or the aircraft\'s registration, as entered into the transponder by the pilot.',
            'icao_tooltip': 'The aircraft\'s unique ICAO identification number shown in hexadecimal format as set in the aircrafts transponder (can be wrong, we will still display the data with the wrong hex).',
            // *** selected_infoblock_summary ***
            'reg_short': 'Reg.:',
            'alt_short': 'Alt.:',
            'spd_short': 'Spd.:',
            'route_short': 'Route:',
            'type_short': 'Type:',
            'source_short': 'Source:',
            // *** anon_mlat_info ***
            'non_icao_hex_info': 'Non-ICAO hex, info:',
            'anonymized_mlat_result': 'Anonymized MLAT result',
            'no_icao_24bit': 'No ICAO 24 bit address',
            'atc_contact_broadcast': 'ATC contact broadcast',
            // *** tisb_info ***
            'tisb_hex_dynamic': 'This hex ID is dynamic and can\'t be connected to a type or registration',
            'tisb_mlat_contact': 'Often corresponding MLAT contact for the same aircraft',
            'tisb_mlat_requires': 'MLAT requires the contact to have a ModeS transponder and reception by 4 receivers',
            'what_is_hex_id': 'What is a hex ID?',
            // *** reg_info ***
            'reg': 'Reg.:',
            'country': 'Country:',
            'db_flags': 'DB flags:',
            'type': 'Type:',
            'year_full': 'Year / Full:',
            'owner_operator': 'Owner / Operator:',
            'type_desc': 'Type desc.:',
            'squawk': 'Squawk:',
            'route': 'Route:',
            'reg_operator_tooltip': 'Registration, operator, type and reported route (if available).',
            'photo_tooltip': 'Aircraft image and copyright information.',
            'reg_code_tooltip': 'The alphanumeric registration code assigned by the country in which the aircraft is registered.',
            'country_tooltip': 'Country of registration as recorded in the aircraft registry.',
            'db_flags_tooltip': 'Flags from the aircraft database indicating special statuses such as Military, PIA (Politically Important Aircraft), or LAD (Locally Assigned).',
            'icao_type_tooltip': 'Short ICAO aircraft type designator (e.g., A320, B738).',
            'year_full_tooltip': 'Year of manufacture / Full type',
            'owner_operator_tooltip2': 'Owner / Operator',
            'type_desc_tooltip': 'ICAO type description (L/S/H Landplane/Seaplane/Helicopter 1/2/3/4 Number of P/T/J Reciprocating/Turboprop/Jet Engines)',
            'squawk_tooltip': 'A 4-digit octal code assigned to the aircraft by Air Traffic Control',
            'route_tooltip': 'Reported flight origin and destination according to adsbdb.com',
            'photo_link_tooltip': 'Opens an external image or photo of the aircraft.',
            // *** Títulos de las secciones ***
            'history_title': 'HISTORY',
            'spatial': 'SPATIAL',
            'signal': 'SIGNAL',
            'fms_sel': 'FMS SEL',
            'wind': 'WIND',
            'speed_section': 'SPEED',
            'altitude_section': 'ALTITUDE',
            'direction': 'DIRECTION',
            'stuff': 'STUFF',
            'accuracy': 'ACCURACY',
            'export_kml': 'EXPORT KML',
            // *** HISTORY ***
            'history_tooltip': 'Show or hide history controls for flight playback.',
            'history_utc_day': 'UTC day:',
            'history_pick_date': 'Pick a date',
            'history_legs_all': 'Legs: All',
            'history_leg_label': 'Leg:',
            'history_time_label': 'Time:',
            'history_loading': 'Loading ...',
            'history_no_data': 'No Data available for',
            'history_slow_down': 'Slow down! ...',
            'previous_day': 'previous',
            'next_day': 'next',
            'previous_leg': 'previous',
            'next_leg': 'next',
            'stop': 'stop',
            'click_trace_to_play': 'Click on the trace line to start playback!',
            // *** SPATIAL ***
            'rid': 'rId:',
            'groundspeed': 'Groundspeed:',
            'baro_altitude': 'Baro. Altitude:',
            'wgs84_altitude': 'WGS84 Altitude:',
            'vert_rate': 'Vert. rate:',
            'track': 'Track:',
            'pos': 'Pos.:',
            'distance': 'Distance:',
            'rid_tooltip': 'receiver id that supplied the position data',
            'groundspeed_tooltip': 'The speed of the aircraft over the ground.',
            'baro_altitude_tooltip': 'The uncorrected pressure-derived height of the aircraft above mean sea level (based on barometric pressure)',
            'wgs84_altitude_tooltip': 'The geometric GPS derived altitude referenced to WGS84 ellipsoid (or reference EGM96 when enabled in the settings)',
            'vert_rate_tooltip': 'Rate of climb or descent',
            'track_tooltip': 'Direction the aircraft is traveling over the ground',
            'pos_tooltip': 'Latitude and longitude coordinates of the aircraft\'s last known position',
            'distance_tooltip': 'Distance of the aircraft from your ADS-B site at its last known position',
            // *** SIGNAL ***
            'source': 'Source:',
            'rssi': 'RSSI:',
            'msg_rate': 'Msg. rate:',
            'messages': 'Messages:',
            'last_pos': 'Last pos.:',
            'last_seen': 'Last seen:',
            'source_tooltip': 'Data source for the reported aircraft data (e.g., ADS-B, MLAT, Other Mode S)',
            'rssi_tooltip': 'Signal strength from this aircraft on your receiver in dBFS',
            'msg_rate_tooltip': 'Number of messages received from this aircraft per second (averaged over the last 2 update intervals)',
            'messages_tooltip': 'Total number of messages received from this aircraft',
            'last_pos_tooltip': 'Time in seconds since a position was received from this aircraft',
            'last_seen_tooltip': 'Time in seconds since a message was received from this aircraft',
            // *** FMS SEL ***
            'sel_alt': 'Sel. alt.:',
            'sel_head': 'Sel. head.:',
            'sel_alt_tooltip': 'The selected altitude in the aircraft\'s flight management system',
            'sel_head_tooltip': 'The selected heading in the aircraft\'s flight management system',
            // *** WIND ***
            'wind_speed': 'Speed:',
            'wind_direction': 'Direction (from):',
            'tat_oat': 'TAT / OAT:',
            'wind_speed_tooltip': 'Calculated wind speed',
            'wind_direction_tooltip': 'Calculated wind is blowing out of this direction',
            'tat_oat_tooltip': 'Total (TAT) / Static (SAT/OAT) air temperature calculated using Mach and true airspeed',
            // *** SPEED ***
            'ground_speed': 'Ground:',
            'true_speed': 'True:',
            'indicated_speed': 'Indicated:',
            'mach': 'Mach:',
            'ground_speed_tooltip': 'The speed of the aircraft over the ground',
            'true_speed_tooltip': 'True airspeed (the speed of the aircraft relative to the airmass in which it is flying)',
            'indicated_speed_tooltip': 'Indicated airspeed (the airspeed read directly from the airspeed indicator on the aircraft)',
            'mach_tooltip': 'The ratio of the speed of the aircraft to the speed of sound in the surrounding space',
            // *** ALTITUDE ***
            'barometric': 'Barometric:',
            'baro_rate': 'Baro. rate:',
            'wgs84': 'WGS84:',
            'geom_rate': 'Geom. rate:',
            'qnh': 'QNH:',
            'barometric_tooltip': 'The uncorrected pressure-derived height of the aircraft above mean sea level (based on barometric pressure)',
            'baro_rate_tooltip': 'Rate of climb or descent (derived from barometric altitude)',
            'wgs84_tooltip': 'The geometric GPS derived altitude referenced to WGS84 ellipsoid (or reference EGM96 when enabled in the settings)',
            'geom_rate_tooltip': 'Rate of climb or descent (derived from avionics which may be inertial or GNSS/satellite-based)',
            'qnh_tooltip': 'The altimeter/QNH setting used by the aircraft\'s navigation systems',
            // *** DIRECTION ***
            'ground_track': 'Ground track:',
            'true_heading': 'True heading:',
            'magnetic_heading': 'Magnetic heading:',
            'magnetic_decl': 'Magnetic decl.:',
            'track_rate': 'Track rate:',
            'roll': 'Roll:',
            'ground_track_tooltip': 'Direction the aircraft is traveling over the ground',
            'true_heading_tooltip': 'The aircraft\'s nose heading relative to true north',
            'magnetic_heading_tooltip': 'The aircraft\'s nose heading relative to magnetic north',
            'magnetic_decl_tooltip': 'Magnetic Declination looked up from the World Magnetic Model',
            'track_rate_tooltip': 'Rate of turn of the ground track',
            'roll_tooltip': 'The aircraft\'s roll angle',
            // *** STUFF ***
            'nav_modes': 'Nav. modes:',
            'adsb_ver': 'ADS-B ver.:',
            'category': 'Category:',
            'nav_modes_tooltip': 'The enabled navigation modes as reported by the aircraft (i.e., auto-pilot, Traffic Collision Avoidance System, altitude hold, approach, LNAV approach, and/or VNAV approach)',
            'adsb_ver_tooltip': 'For ADS-B-equipped aircraft, the version of ADS-B to which the aircraft conforms, as reported by the aircraft',
            'category_tooltip': 'Aircraft category code as reported by the aircraft, this indicates the type of aircraft and, for airplanes, a relative indicator of its size',
            // *** ACCURACY ***
            'nac_p': 'NAC<sub>P</sub>:',
            'sil': 'SIL:',
            'nac_v': 'NAC<sub>V</sub>:',
            'nic_baro': 'NIC<sub>BARO</sub>:',
            'rc': 'R<sub>C</sub>:',
            'pos_epoch': 'Pos. epoch:',
            'learn_more_modes': 'Learn more about Mode S data type by hovering over each data label.',
            'nac_p_tooltip': 'Navigation accuracy category of the position (95% bound on positions)',
            'sil_tooltip': 'Surveillance integrity level (probability of positions lying outside the claimed radius of containment)',
            'nac_v_tooltip': 'Navigation accuracy category of the velocity (95% bound on velocities)',
            'nic_baro_tooltip': 'Whether the reported pressure altitude has been crosschecked against another source of pressure altitude',
            'rc_tooltip': 'Radius of containment, the reported position of the aircraft is expected to be within this distance of the true position, with a failure rate defined by SIL',
            'pos_epoch_tooltip': 'Unix timestamp of the last received position report from the aircraft.',
            // *** EXPORT KML ***
            'export_kml_geom': 'geometric altitude (EGM96)',
            'export_kml_geom_avg': 'baro + avg.(EGM96 - baro)',
            'export_kml_baro': 'uncorrected pressure alt.',
            'export_kml_geom_tooltip': 'Export KML using geometric altitude (EGM96).',
            'export_kml_geom_avg_tooltip': 'Export KML using barometric altitude plus EGM96 average correction.',
            'export_kml_baro_tooltip': 'Export KML using uncorrected pressure altitude (barometric).',
            // *** Tooltips de las secciones ***
            'spatial_tooltip': 'Show or hide spatial data: groundspeed, altitude, position and distance.',
            'signal_tooltip': 'Show or hide signal details such as RSSI, message rate, total messages, last position and last seen.',
            'fms_tooltip': 'Show or hide selected FMS settings: selected altitude and selected heading.',
            'wind_tooltip': 'Show or hide wind data: speed, direction (from), and temperatures (TAT/OAT).',
            'speed_tooltip': 'Show or hide speed data: ground speed, true airspeed, indicated airspeed, and mach number.',
            'altitude_tooltip': 'Show or hide altitude details: barometric, geometric, climb/descend rates, and QNH.',
            'direction_tooltip': 'Show or hide direction data: ground track, true heading, magnetic heading, magnetic declination, track rate and roll.',
            'stuff_tooltip': 'Show or hide miscellaneous aircraft data such as navigation modes, ADS-B version, and category.',
            'accuracy_tooltip': 'Show or hide precision and integrity indicators: NACp, SIL, NACv, NIC_BARO, radius of containment (Rc), and position epoch.',
            'export_kml_tooltip': 'Export the current aircraft position to a KML file for viewing in mapping applications. Choose altitude source: geometric, geom_avg, or baro.',

            // *** SETTINGS_INFOBLOCK ***
            // *** Encabezado ***
            'settings': 'Settings',
            'reset_all_settings': 'Reset all settings',
            'restore_default_size': 'Restore default size',
            'close': 'Close',
            'text_icon_size': 'Text and icon size:',
            'icon_size_multiplier': 'Icon size multiplier:',
            'reset_to_default_size': 'Reset to default size',
            'reset': 'Reset',
            'reset_to_default_multiplier': 'Reset to default multiplier',
            // *** UNITS ***
            'select_measurement_system': 'Select the measurement system',
            'aeronautical': 'Aeronautical',
            'metric': 'Metric',
            'imperial': 'Imperial',
            'reset_to_default': 'Reset to default',
            // *** Nombres de las categorías ***
            'units': 'UNITS',
            'display': 'DISPLAY',
            'filters_category': 'FILTERS',
            'data': 'DATA',
            'system': 'SYSTEM',
            'information': 'INFORMATION',
            // *** DISPLAY ***
            'colored_planes': 'Colored planes',
            'colored_planes_tooltip': 'Display aircraft markers in color instead of grayscale.',
            'colored_trails': 'Colored trails',
            'colored_trails_tooltip': 'Display aircraft trails in color instead of grayscale.',
            'altitude_chart': 'Color-coded altitude chart',
            'altitude_chart_tooltip': 'Displays an altitude profile chart, showing altitude with units and a color legend.',
            'dim_map': 'Dim map',
            'dim_map_tooltip': 'Toggle dimming of map layers to enhance visibility of overlays.',
            'label_units': 'Label units',
            'label_units_tooltip': 'Show units (ft, kts, etc.) in the labels.',
            'webgl': 'Canvas WebGL',
            'webgl_tooltip': 'Use WebGL to display aircraft icons. This can significantly improve performance, especially when many aircraft are displayed, but may cause issues on some devices/browsers.',
            // *** FILTERS ***
            'ground_vehicles': 'Ground vehicles',
            'ground_vehicles_tooltip': 'Displays ground service vehicles that emit ADS-B signal.',
            'non_icao_targets': 'Non-ICAO targets (radar track / airframe unknown)',
            'non_icao_targets_tooltip': 'Displays aircraft that do not have a standard ICAO code or whose airframe structure is unknown.',
            'hide_aircraft_functions': 'Hide aircraft functions',
            'hide_aircraft_functions_tooltip': 'Hides the aircraft action dropdown and disables aircraft-specific controls (selection, follow, infoblock, and related functions).',
            'hide_elevation_function': 'Hide elevation function',
            'hide_elevation_function_tooltip': 'Hide the feature for drawing the elevation profile between two points.',
            'hide_distance_functions': 'Hide distance functions',
            'hide_distance_functions_tooltip': 'Hides the measurement dropdown and disables all distance tools (aircraft-aircraft, ground-aircraft, ground-ground).',
            'hide_label_functions': 'Hide label functions',
            'hide_label_functions_tooltip': 'Hides label controls and disables aircraft labels and related label settings (live/historic labels, units, and formatting).',
            'hide_layer_functions': 'Hide layer functions',
            'hide_layer_functions_tooltip': 'Hides layer controls and prevents changing or interacting with map layers and overlay settings (base layers, overlays, and layer switcher).',
            'hide_recenter_function': 'Hide recenter function',
            'hide_recenter_function_tooltip': 'Hides the recenter control and disables manual re-centering of the map to the site.',
            'hide_replay_function': 'Hide replay function',
            'hide_replay_function_tooltip': 'Hides the replay controls and disables timeline playback and related replay controls (play, pause).',
            'hide_track_functions': 'Hide track functions',
            'hide_track_functions_tooltip': 'Hides track controls and prevents drawing or interacting with aircraft trails and track-related features.',
            'hide_zoom_functions': 'Hide zoom functions',
            'hide_zoom_functions_tooltip': 'Hides zoom controls and disables map zooming.',
            // *** DATA ***
            'baro_alt_correct_qnh': 'Baro. alt.: correct for QNH',
            'baro_alt_correct_qnh_tooltip': 'Adjusts pressure altitude according to local atmospheric pressure (QNH) to display the actual altitude above sea level.',
            'geom_alt_wgs84_egm': 'Geom. alt.: WGS84 -> EGM conversion (long load)',
            'geom_alt_wgs84_egm_tooltip': 'It applies a mathematical correction to make the GPS altitude more accurate relative to sea level (it takes longer to load).',
            'historic_track_labels_utc': 'Historic track labels: UTC',
            'historic_track_labels_utc_tooltip': 'When enabled with Track Tools > Track Labels, displays timestamps in UTC instead of local time.',
            'labels_geom_alt': 'Labels: geom. alt. (WGS84)',
            'labels_geom_alt_tooltip': 'When enabled with Label Tools > Track Labels, displays geometric altitude (GPS) instead of standard barometric altitude.',
            'live_track_labels_utc': 'Live track labels: UTC',
            'live_track_labels_utc_tooltip': 'When enabled with Track Tools > Track Labels, displays timestamps on live paths using Universal Time (UTC).',
            'notable_aircraft': 'Notable Aircraft',
            'notable_aircraft_tooltip': 'Enable/disable the starred aircraft feature. Allows marking aircraft as notable and displays them in the sidebar.',
            // *** SYSTEM ***
            'auto_select_plane': 'Auto-select plane',
            'auto_select_plane_tooltip': 'Automatically selects the aircraft closest to the map center every 5 seconds. Only considers aircraft with a recent position (seen in last 20 seconds).',
            'debug_show_all': 'Debug show all',
            'debug_show_all_tooltip': 'Show all debug information.',
            'debug_tracks': 'Debug tracks',
            'debug_tracks_tooltip': 'When enabled with Track Tools > All Tracks, displays detailed track information in the console',
            'hide_all_tooltips': 'Hide all tooltips',
            'hide_all_tooltips_tooltip': 'Hides all element tooltips across the entire page (removes/restores title attributes).',
            'hide_settings_tooltips': 'Hide settings tooltips',
            'hide_settings_tooltips_tooltip': 'Hides tooltips for controls inside the settings menu.',
            'include_filters_in_urls': 'Include filters in URLs',
            'include_filters_in_urls_tooltip': 'Include the current filter settings in the URL.',
            'update_gps_location': 'Update GPS location',
            'update_gps_location_tooltip': 'Updates the browser/device GPS location and enables periodic tracking to center the map; requires browser permission.',
            // *** INFORMATION ***
            'enable_infoblock': 'Enable infoblock',
            'enable_infoblock_tooltip': 'Show the infoblock with detailed information about the selected aircraft.',
            'enable_mouseover_block': 'Enable mouse-over block',
            'enable_mouseover_block_tooltip': 'Show detailed information about the selected aircraft when hovering over it.',
            'lookup_route': 'Lookup route',
            'lookup_route_tooltip': 'Look up the route of the aircraft (origin and destination airports) using an online API (if available).',
            'pictures_planespotting_be': 'Pictures planespotting.be',
            'pictures_planespotting_be_tooltip': 'Display pictures from planespotting.be (if available).',
            'pictures_planespotters_net': 'Pictures planespotters.net',
            'pictures_planespotters_net_tooltip': 'Display pictures from planespotters.net (if available).',
            'wide_infoblock': 'Wide infoblock',
            'wide_infoblock_tooltip': 'Use a wider layout for the infoblock, allowing more information to be displayed in a single line.',
            // *** reset-all-settings-btn ***
            'reset_all_settings': 'Reset all settings',
            'reset_all_settings_confirm': 'This will restore all settings to their default values.',
            'reset_all_settings_reload': 'The page will reload to apply the changes.',
            'cancel': 'Cancel',
            'reset_reload': 'Reset & Reload',
            'error_connect_server': "Can't connect to server, check your network!",
            'error_data_not_updated': "The data from the server hasn't been updated in a while.",

            // *** NAVBAR ***
            'utc': 'UTC',
            'utc_tooltip': 'Current UTC time - Universal Time Coordinated.',
            'zoom_tooltip': 'Zoom',
            'zoom_tooltip_text': 'Current zoom level: {zoom} ({pct}% relative to base zoom {baseline})',
            'search_placeholder': 'Search for planes, airports...',
            'search_tooltip': 'Use decimal coordinates (lat,lon) to search airports. Use ICAO24 hex or callsign to search flights.',
            'open_sidebar': 'Open Sidebar',
            'toggle_sidebar': 'Toggle Sidebar',

            // *** HEADER_SIDE ***
            // *** aircraft_dropdown ***
            'aircraft_tools': 'Aircraft tools',
            'aircraft_tools_tooltip': 'Aircraft tools - Open aircraft filtering and tracking options.',
            'current_view': 'Current view',
            'current_view_tooltip': 'Show only aircraft currently visible on the map.',
            'multi_select': 'Multi-select',
            'multi_select_tooltip': 'Enable selecting multiple aircraft at the same time.',
            'persistence': 'Persistence',
            'persistence_tooltip': 'Keep historical positions visible for a short period.',
            'isolate': 'Isolate',
            'isolate_tooltip': 'Show only the selected aircraft and hide the rest.',
            'military_only': 'Military only',
            'military_only_tooltip': 'Display only aircraft identified as military.',
            'follow': 'Follow',
            'follow_tooltip': 'Keep the selected aircraft centered on the map.',
            // *** measurement_dropdown ***
            'measurement_tools': 'Measurement tools',
            'measurement_tools_tooltip': 'Measurement tools - Open measurement options.',
            'aircraft_aircraft': 'Aircraft-aircraft',
            'aircraft_aircraft_tooltip': 'Measure distance between two aircraft.',
            'ground_point_aircraft': 'Ground point-aircraft',
            'ground_point_aircraft_tooltip': 'Measure distance from a ground point to an aircraft.',
            'ground_point_ground_point': 'Ground point-ground point',
            'ground_point_ground_point_tooltip': 'Measure distance between two ground points.',
            // *** track_dropdown ***
            'track_tools': 'Track tools',
            'track_tools_tooltip': 'Track tools - Open track display options.',
            'all_tracks': 'All tracks',
            'all_tracks_tooltip': 'Display tracks for all visible aircraft.',
            'track_labels': 'Track labels',
            'track_labels_tooltip': 'Show or hide labels on aircraft tracks.',
            // *** label_dropdown ***
            'label_tools': 'Label tools',
            'label_tools_tooltip': 'Label tools - Open label visibility options.',
            'labels': 'Labels',
            'labels_tooltip': 'Show or hide primary aircraft labels.',
            'label_details': 'Label details',
            'label_details_tooltip': 'Show or hide extended label information.',

            'expand_sidebar': 'Expand Sidebar',
            'settings_tooltip': 'Open application preferences and display options.',
            'recenter_tooltip': 'Recenter the map and restore the default view.',
            'replay_tooltip': 'Open playback controls for historical flights.',
            'zoom_in_tooltip': 'Zoom In - Increase map zoom level.',
            'zoom_out_tooltip': 'Zoom Out - Decrease map zoom level.',

            // *** PANORAMA-OVERLAY ***
            'elevation_tooltip': 'Display the elevation of the existing terrain between two points.',
            'wait_for_elevation': 'Wait for the elevation to finish rendering...',
            'building_elevation': 'Building elevation...',
            'no_data': 'No significant data to draw from.',
            'data_error': 'Batch elevation error:',
            'elevation_mark_point_a': 'Click on the map to mark point A.',
            'elevation_mark_point_b': 'Now, click on the map again to mark point B.',
            'layer_group_elevation_tool': 'Elevation tool',
            'layer_elev_points': 'A-B Ground points',
            'layer_elev_line': 'A-B Line',

            // *** REPLAY ***
            'play': 'Play',
            'pause': 'Pause',
            'date_label': 'Date',
            // 'utc_label': 'UTC:',
            'playback_label': 'Playback',
            'hours_label': 'Hours',
            'minutes_label': 'Minutes',
            'speed_label': 'Speed',
            'loading': 'Loading...',
            'replay_placeholder': 'Select a date to replay...',

            // *** SIDEBAR_CONTAINER ***
            'toggle_sidebar': 'Toggle Sidebar',
            'show_map': 'Show Map',
            'control_sidebar_width': 'Control the width of the sidebar.',
            'total_aircraft': 'Total Aircraft:',
            'messages': 'Messages:',
            'per_sec': '/sec',
            'with_position': 'With Position:',
            'history': 'History:',
            'positions': 'positions',
            'altimeter': 'Altimeter:',
            'set': 'Set',
            'standard': 'Standard',
            'from_plane': 'From Plane',
            'improve_coverage': 'Improve Coverage:',
            'faq': 'FAQ',
            'map_help': 'Map Help',
            'adsb_feeder_config': 'ADSB Feeder Image Config',
            // *** tabs ***
            'filter_flights_tooltip': 'Filter flights by specific criteria.',
            'filters': 'Filters',
            'select_columns_tooltip': 'Select which columns to display in the aircraft table.',
            'columns': 'Columns',
            'restore_sidebar_tooltip': 'Restore sidebar to default width',
            'restore': 'Restore',
            'filter_by_altitude': 'Filter by altitude:',
            'filter': 'Filter',
            'reset': 'Reset',
            'filter_by_source': 'Filter by source:',
            'filter_by_db_flags': 'Filter by DB flags:',
            'clear': 'Clear',
            'search_flight_placeholder': 'Search by callsign, squawk or ICAO hex...',
            'search_type_placeholder': 'Search by type code, description or category...',
            'search_reg_placeholder': 'Search by registration, route or country...',
            'min_ft': 'Min ft',
            'max_ft': 'Max ft',
            'filter_flight': 'Flight',
            'filter_aircraft_type': 'Aircraft type',
            'filter_registration_route': 'Registration & route',
            'filter_source': 'Source',
            'filter_db_flags': 'DB Flags',
            'filter_altitude': 'Altitude',
            'clear': 'Clear',
            'apply': 'Apply',
            'reset': 'Reset',
            'restore_default_columns': 'Restore default columns',
            'error_min_alt_greater': 'ERROR: Minimum altitude ({min}) cannot be greater than maximum altitude ({max}). Please correct the values.',
            'no_limit': 'no limit',
            'altitude_filter_active': '✓ Altitude filter active:',
            'to': 'to',
            // *** planesTable ***
            'active_columns': 'Active columns',
            'inactive_columns': 'Inactive columns',
            'col_icao': 'Hex ID',
            'col_country': 'Flag',
            'col_flight': 'Callsign',
            'col_route': 'Route',
            'col_registration': 'Registration',
            'col_type': 'Type',
            'col_squawk': 'Squawk',
            'col_altitude': 'Alt.',
            'col_speed': 'Spd.',
            'col_sitedist': 'Dist.',
            'col_track': 'Track',
            'col_msgs': 'Messages',
            'col_seen': 'Seen',
            'col_rssi': 'RSSI',
            'col_lat': 'Latitude',
            'col_lon': 'Longitude',
            'col_data_source': 'Source',
            'col_military': 'Mil.',
            'col_wd': 'Wind D.',
            'col_ws': 'Wind S.',
            'col_vert_rate': 'V. Rate',
            'unit_ft': 'ft',
            'unit_kt': 'kt',
            'unit_nm': 'NM',

            'more_table_lines': 'More Table Lines',
            'even_more_table_lines': 'Even More',
            'all_table_lines': 'All Table Lines',
            'more_table_lines_tooltip': 'Increase the number of aircraft displayed in the table.',
            'even_more_table_lines_tooltip': 'Further increase the number of aircraft displayed in the table.',
            'all_table_lines_tooltip': 'Show all aircraft in the table (may affect performance).',
            'table_display_options': 'Table display options',

            'aircraft_list': 'Aircraft List',

            // *** starred-aircraft-section ***
            'notable_aircraft': 'Notable aircraft',
            'no_marked_planes': 'No marked planes',
            'clear_all_notable': 'Clear all notable aircraft',

            'error_fetching_data': 'Problem fetching data from the server:',

            // *** FUNCIONES DE DISTANCIA ***
            'signal_lost': 'SIGNAL LOST',
            'retrying': 'Retrying...',
            'dist_label': 'Dist:',
            'alt_diff_label': 'Alt Diff:',
            'nm': 'NM',
            'ft': 'ft',
            'mode_label': 'Mode',
            'distance_label': 'Distance:',
            // *** Aeronave-Aeronave ***
            '1_aircraft_1_aircraft': '1 Aircraft - 1 Aircraft Mode',
            'select_aircraft_valid_position': 'Select an aircraft with a valid position.',
            'select_aircraft_complete_pair': 'Select an aircraft to complete the pair.',
            'pairs_mode': 'Pairs Mode',
            // 'click_two_aircraft_measure': 'Click on two aircraft to measure the distance.',
            'distance_select_plane_a': 'Click on an aircraft to mark point A.',
            'distance_select_plane_b': 'Click on another aircraft to mark point B.',
            'distance_invalid_aircraft': 'Select an aircraft.',
            'click_two_aircraft_sequence': 'Click on two aircraft in sequence to create independent pairs (A-B, C-D), or click twice on an aircraft to anchor it and then select multiple B points.',
            'first_selected': 'First selected. Click another aircraft to form a pair, or click this aircraft again to anchor it.',
            'anchor_aircraft': 'Anchor aircraft. Now click on B aircraft to create pairs with A. Click A again to unanchor.',
            'pair_already_exists': 'Pair already exists.',
            'independent_pair_added': 'Independent pair added.',
            'anchor_disabled': 'Anchor disabled.',
            'pair_added': 'Pair added.',
            'anchor_lost': 'Anchor aircraft lost signal. Select a new anchor or click on two aircraft to form pairs.',
            // *** Tierra-Aeronave ***
            'ta_click_map_point_a': 'Click on the map to mark point A.',
            'ta_click_map_single_point_a': 'Click on the map to mark a single point A.',
            'ta_click_map_multiple_points_a': 'Click on the map to mark multiple points A.',
            'ta_click_aircraft_point_b': 'Click on an aircraft to mark point B.',
            'ta_click_aircraft_multiple_points_b': 'Click on one or more aircraft to mark multiple points B.',
            'ta_click_aircraft_single_point_b': 'Click on an aircraft to mark a single point B.',
            'ta_1_point_1_aircraft': '1 Point - 1 Aircraft Mode',
            'ta_1_point_multiple_aircraft': '1 Point - Multiple Aircraft Mode',
            'ta_multiple_points_1_aircraft': 'Multiple Points - 1 Aircraft Mode',
            'ta_multiple_points_multiple_aircraft': 'Multiple Points - Multiple Aircraft Mode',
            'first_mark_point_a': 'First mark point A.',
            'first_mark_at_least_one_point_a': 'First mark at least one point A.',
            // *** Tierra-Tierra ***
            'gg_1_point_1_point': '1 Point - 1 Point Mode',
            'gg_1_point_multiple_points': '1 Point - Multiple Points Mode',
            'gg_multiple_points_multiple_points': 'Multiple Points - Multiple Points Mode',
            'gg_click_map_point_b': 'Click on the map to mark point B.',
            'gg_click_map_multiple_points_b': 'Click on the map to mark multiple points B.',

            // *** MENÚ DE CAPAS ***
            'layer_tools_title': 'Layer tools',
            'layer_webgllayer': 'Aircraft pos. webGL',
            'layer_iconlayer': 'Aircraft label',
            'layer_locationdot': 'Site position',
            'layer_sitecircles': 'Range rings',
            // *** Dropdown de distancia ***
            'layer_group_distance_tools': 'Distance tools',
            'layer_group_ground_point_ground_point': 'Ground point-ground point',
            'layer_groundtoground': 'A-B Line',
            'layer_group_ground_point_aircraft': 'Ground point-aircraft',
            'layer_groundtoplane': 'A-B Line',
            'layer_groundpoint': 'Ground point',
            'layer_group_aircraft_aircraft': 'Aircraft-aircraft',
            'layer_ggpoints': 'A-B ground points',
            'layer_distancelines': 'A-B Line',
            // *** Capas base IFR ***
            'layer_group_ifrhigh': 'IFR High',
            'layer_group_ifrlow': 'IFR Low',
            // *** Dropdown Worldwide ***
            'layer_group_world': 'Worldwide',
            'layer_osm_tiles_offline': 'Map Offline',
            'layer_rainviewer_radar': 'RainViewer Radar',
            // *** Overlays IFR/VFR/TMA ***
            'layer_base': 'Base',
            'layer_map': 'Map',
            'layer_airports_aerodromes': 'Airports / Aerodromes',
            'layer_airspace_classes': 'Airspace Classes',
            'layer_airways_air_routes': 'Airways / Air Routes',
            'layer_controlled_airspace': 'Controlled Airspace',
            'layer_grid_mora_mea': 'Grid MORA / MEA',
            'layer_navaids': 'Navaids',
            'layer_obstacles': 'Obstacles',
            'layer_political_boundaries': 'Political Boundaries',
            'layer_special_use_airspace': 'Special Use Airspace',
            'layer_terrain_topography': 'Terrain / Topography',
            'layer_waypoints_fixes': 'Waypoints / Fixes',
            'layer_weather_radar': 'Weather / Radar',

            'elevation_ground_aircraft_tooltip': 'Display terrain elevation from a ground point to an aircraft.',
            'hide_elevation_ground_aircraft_function': 'Hide ground-aircraft elevation function',
            'hide_elevation_ground_aircraft_function_tooltip': 'Hide the terrain elevation profile from a ground point to an aircraft.',
            'elevation_mark_ground_point': 'Click on the map to mark the ground point.',
            'elevation_mark_ground_first': 'First mark a ground point.',
            'elevation_select_aircraft': 'Now click on an aircraft.',
            'elevation_invalid_aircraft': 'The aircraft position is unavailable.',
            'elevation_next_update': 'Next update in {seconds}s',
        },
        es: {
            'copyright_text': 'ADS-B VENEZUELA — Desarrollado por EANSA. <br> <a href="https://github.com/wiedehopf/tar1090" target="_blank" rel="noopener noreferrer" style="color: gray;">tar1090</a>',

            // *** HEAD ***
            'meta_description': 'ADS‑B Venezuela - Monitoreo de tráfico aéreo en Venezuela',

            // *** HIGHLIGHTED_INFOBLOCK ***
            'reg': 'Matr.:',
            'type_code': 'Código tipo:',
            'route': 'Ruta:',
            'route_tooltip': 'Origen y destino del vuelo reportado según adsb.lol',
            'altitude': 'Altitud:',
            'speed': 'Velocidad:',
            'source': 'Fuente:',
            'rssi': 'RSSI:',
            'n/a': 'n/d',

            // *** SELECTED_INFOBLOCK ***

            'copy_link': 'Copiar enlace',
            'copied': '¡Copiado!',
            'copy_link_tooltip': 'Copiar enlace compartible al portapapeles',

            'no_callsign': 'Sin indicativo',

            // *** highlightedTitle infoBlockSection ***
            'mark_as_notable': 'Marcar como destacado',
            'remove_from_notable': 'Quitar de destacados',
            'minimize_infoblock': 'Minimizar bloque de información',
            'restore_infoblock': 'Restaurar bloque de información',
            'close': 'Cerrar',
            'callsign_tooltip': 'Normalmente el indicativo de control de tránsito aéreo o la matrícula de la aeronave, ingresado por el piloto en el transponder.',
            'icao_tooltip': 'Número de identificación ICAO único de la aeronave en formato hexadecimal configurado en el transponder (puede ser incorrecto, aun así mostraremos los datos con el hex incorrecto).',
            // *** selected_infoblock_summary ***
            'reg_short': 'Matr.:',
            'alt_short': 'Alt.:',
            'spd_short': 'Vel.:',
            'route_short': 'Ruta:',
            'type_short': 'Tipo:',
            'source_short': 'Fuente:',
            // *** anon_mlat_info ***
            'non_icao_hex_info': 'Hex no-ICAO, info:',
            'anonymized_mlat_result': 'Resultado MLAT anonimizado',
            'no_icao_24bit': 'Sin dirección ICAO de 24 bits',
            'atc_contact_broadcast': 'Transmisión de contacto ATC',
            // *** tisb_info ***
            'tisb_hex_dynamic': 'Este ID hex es dinámico y no puede conectarse a un tipo o matrícula',
            'tisb_mlat_contact': 'Frecuentemente contacto MLAT correspondiente para la misma aeronave',
            'tisb_mlat_requires': 'MLAT requiere que el contacto tenga un transponder ModeS y recepción por 4 receptores',
            'what_is_hex_id': '¿Qué es un ID hex?',
            // *** reg_info ***
            'reg': 'Matr.:',
            'country': 'País:',
            'db_flags': 'Banderas BD:',
            'type': 'Tipo:',
            'year_full': 'Año / Tipo Compl.:',
            'owner_operator': 'Propietario / Operador:',
            'type_desc': 'Desc. tipo:',
            'squawk': 'Squawk:',
            'route': 'Ruta:',
            'reg_operator_tooltip': 'Matrícula, operador, tipo y ruta reportada (si está disponible).',
            'photo_tooltip': 'Imagen de la aeronave e información de derechos de autor.',
            'reg_code_tooltip': 'Código de matrícula alfanumérico asignado por el país en el que está registrada la aeronave.',
            'country_tooltip': 'País de registro según consta en el registro de aeronaves.',
            'db_flags_tooltip': 'Banderas de la base de datos que indican estados especiales como Militar, PIA (Aeronave Políticamente Importante) o LADD (Asignación Local).',
            'icao_type_tooltip': 'Designador corto de tipo de aeronave ICAO (ej. A320, B738).',
            'year_full_tooltip': 'Año de fabricación / Tipo completo',
            'owner_operator_tooltip2': 'Propietario / Operador',
            'type_desc_tooltip': 'Descripción de tipo ICAO (L/S/H Avión/Hidroavión/Helicóptero 1/2/3/4 Número de motores P/T/J Alternativos/Turborreactores/Reacción)',
            'squawk_tooltip': 'Código octal de 4 dígitos asignado a la aeronave por Control de Tránsito Aéreo',
            'route_tooltip': 'Origen y destino del vuelo reportado según adsbdb.com',
            'photo_link_tooltip': 'Abre una imagen o foto externa de la aeronave.',
            // *** Títulos de las secciones ***
            'history_title': 'HISTORIAL',
            'spatial': 'ESPACIAL',
            'signal': 'SEÑAL',
            'fms_sel': 'FMS (SELECCIÓN)',
            'wind': 'VIENTO',
            'speed_section': 'VELOCIDAD',
            'altitude_section': 'ALTITUD',
            'direction': 'DIRECCIÓN',
            'stuff': 'VARIOS',
            'accuracy': 'PRECISIÓN',
            'export_kml': 'EXPORTAR KML',
            // *** HISTORY ***
            'history_tooltip': 'Mostrar u ocultar los controles de historial para reproducción de vuelos.',
            'history_utc_day': 'Día UTC:',
            'history_pick_date': 'Selecc. fecha',
            'history_legs_all': 'Tramos: Todos',
            'history_leg_label': 'Tramo:',
            'history_time_label': 'Hora:',
            'history_loading': 'Cargando ...',
            'history_no_data': 'No hay datos disponibles para',
            'history_slow_down': '¡Reduzca la velocidad! ...',
            'previous_day': 'anterior',
            'next_day': 'siguiente',
            'previous_leg': 'anterior',
            'next_leg': 'siguiente',
            'stop': 'detener',
            'click_trace_to_play': '¡Haz clic en la línea de ruta para iniciar la reproducción!',
            // *** SPATIAL ***
            'rid': 'rId:',
            'groundspeed': 'Vel. suelo:',
            'baro_altitude': 'Alt. Baro.:',
            'wgs84_altitude': 'Alt. WGS84:',
            'vert_rate': 'Raz. vert.:',
            'track': 'Rumbo:',
            'pos': 'Pos.:',
            'distance': 'Distancia:',
            'rid_tooltip': 'ID del receptor que proporcionó los datos de posición',
            'groundspeed_tooltip': 'Velocidad de la aeronave sobre el suelo.',
            'baro_altitude_tooltip': 'Altitud derivada de la presión sin corregir sobre el nivel medio del mar (basada en presión barométrica)',
            'wgs84_altitude_tooltip': 'Altitud derivada de GPS geométrica referenciada al elipsoide WGS84 (o referencia EGM96 cuando está habilitado en la configuración)',
            'vert_rate_tooltip': 'Tasa de ascenso o descenso',
            'track_tooltip': 'Dirección en la que viaja la aeronave sobre el suelo',
            'pos_tooltip': 'Coordenadas de latitud y longitud de la última posición conocida de la aeronave',
            'distance_tooltip': 'Distancia de la aeronave desde su sitio ADS-B en su última posición conocida',
            // *** SIGNAL ***
            'source': 'Fuente:',
            'rssi': 'RSSI:',
            'msg_rate': 'Raz. mens.:',
            'messages': 'Mensajes:',
            'last_pos': 'Últ. pos.:',
            'last_seen': 'Últ. visto:',
            'source_tooltip': 'Fuente de datos para los datos reportados de la aeronave (ej. ADS-B, MLAT, Otro Mode S)',
            'rssi_tooltip': 'Potencia de señal de esta aeronave en su receptor en dBFS',
            'msg_rate_tooltip': 'Número de mensajes recibidos de esta aeronave por segundo (promediado en los últimos 2 intervalos de actualización)',
            'messages_tooltip': 'Número total de mensajes recibidos de esta aeronave',
            'last_pos_tooltip': 'Tiempo en segundos desde que se recibió una posición de esta aeronave',
            'last_seen_tooltip': 'Tiempo en segundos desde que se recibió un mensaje de esta aeronave',
            // *** FMS SEL ***
            'sel_alt': 'Alt. sel.:',
            'sel_head': 'Rumbo sel.:',
            'sel_alt_tooltip': 'Altitud seleccionada en el sistema de gestión de vuelo de la aeronave',
            'sel_head_tooltip': 'Rumbo seleccionado en el sistema de gestión de vuelo de la aeronave',
            // *** WIND ***
            'wind_speed': 'Velocidad:',
            'wind_direction': 'Dirección (desde):',
            'tat_oat': 'TAT / OAT:',
            'wind_speed_tooltip': 'Velocidad del viento calculada',
            'wind_direction_tooltip': 'Dirección desde la que sopla el viento calculado',
            'tat_oat_tooltip': 'Temperatura total (TAT) / Estática (SAT/OAT) calculada usando Mach y velocidad verdadera',
            // *** SPEED ***
            'ground_speed': 'Suelo:',
            'true_speed': 'Verdadera:',
            'indicated_speed': 'Indicada:',
            'mach': 'Mach:',
            'ground_speed_tooltip': 'Velocidad de la aeronave sobre el suelo',
            'true_speed_tooltip': 'Velocidad verdadera (velocidad de la aeronave relativa a la masa de aire en la que vuela)',
            'indicated_speed_tooltip': 'Velocidad indicada (velocidad leída directamente del indicador de velocidad de la aeronave)',
            'mach_tooltip': 'Relación entre la velocidad de la aeronave y la velocidad del sonido en el espacio circundante',
            // *** ALTITUDE ***
            'barometric': 'Barométrica:',
            'baro_rate': 'Raz. baro.:',
            'wgs84': 'WGS84:',
            'geom_rate': 'Raz. geom.:',
            'qnh': 'QNH:',
            'barometric_tooltip': 'Altitud derivada de presión sin corregir sobre el nivel medio del mar (basada en presión barométrica)',
            'baro_rate_tooltip': 'Tasa de ascenso o descenso (derivada de altitud barométrica)',
            'wgs84_tooltip': 'Altitud derivada de GPS geométrica referenciada al elipsoide WGS84 (o referencia EGM96 cuando está habilitado en la configuración)',
            'geom_rate_tooltip': 'Tasa de ascenso o descenso (derivada de la aviónica que puede ser inercial o basada en GNSS/satélite)',
            'qnh_tooltip': 'Configuración del altímetro/QNH utilizada por los sistemas de navegación de la aeronave',
            // *** DIRECTION ***
            'ground_track': 'Rumbo suelo:',
            'true_heading': 'Rumbo verdadero:',
            'magnetic_heading': 'Rumbo magnético:',
            'magnetic_decl': 'Decl. magn.:',
            'track_rate': 'Raz. rumbo:',
            'roll': 'Alabeo:',
            'ground_track_tooltip': 'Dirección en la que viaja la aeronave sobre el suelo',
            'true_heading_tooltip': 'Rumbo del morro de la aeronave relativo al norte verdadero',
            'magnetic_heading_tooltip': 'Rumbo del morro de la aeronave relativo al norte magnético',
            'magnetic_decl_tooltip': 'Declinación magnética obtenida del Modelo Magnético Mundial',
            'track_rate_tooltip': 'Tasa de giro del rumbo de suelo',
            'roll_tooltip': 'Ángulo de alabeo de la aeronave',
            // *** STUFF ***
            'nav_modes': 'Modos nav.:',
            'adsb_ver': 'Ver. ADS-B:',
            'category': 'Categoría:',
            'nav_modes_tooltip': 'Modos de navegación habilitados reportados por la aeronave (ej. piloto automático, sistema de anticolisión, mantenimiento de altitud, aproximación, aproximación LNAV y/o VNAV)',
            'adsb_ver_tooltip': 'Para aeronaves equipadas con ADS-B, la versión de ADS-B a la que se ajusta la aeronave, según lo reportado por la misma',
            'category_tooltip': 'Código de categoría de la aeronave reportado por la misma, indica el tipo de aeronave y, para aviones, un indicador relativo de su tamaño',
            // *** ACCURACY ***
            'nac_p': 'NAC<sub>P</sub>:',
            'sil': 'SIL:',
            'nac_v': 'NAC<sub>V</sub>:',
            'nic_baro': 'NIC<sub>BARO</sub>:',
            'rc': 'R<sub>C</sub>:',
            'pos_epoch': 'Época pos.:',
            'learn_more_modes': 'Aprende más sobre los datos Mode S pasando el cursor sobre cada etiqueta de datos.',
            'nac_p_tooltip': 'Categoría de precisión de navegación de la posición (límite del 95% en posiciones)',
            'sil_tooltip': 'Nivel de integridad de vigilancia (probabilidad de posiciones fuera del radio de contención declarado)',
            'nac_v_tooltip': 'Categoría de precisión de navegación de la velocidad (límite del 95% en velocidades)',
            'nic_baro_tooltip': 'Si la altitud de presión reportada ha sido cotejada con otra fuente de altitud de presión',
            'rc_tooltip': 'Radio de contención, se espera que la posición reportada de la aeronave esté dentro de esta distancia de la posición real, con una tasa de fallos definida por SIL',
            'pos_epoch_tooltip': 'Marca de tiempo Unix del último informe de posición recibido de la aeronave.',
            // *** EXPORT KML ***
            'export_kml_geom': 'altitud geométrica (EGM96)',
            'export_kml_geom_avg': 'baro + prom.(EGM96 - baro)',
            'export_kml_baro': 'altitud presión sin corregir',
            'export_kml_geom_tooltip': 'Exportar KML usando altitud geométrica (EGM96).',
            'export_kml_geom_avg_tooltip': 'Exportar KML usando altitud barométrica más corrección promedio EGM96.',
            'export_kml_baro_tooltip': 'Exportar KML usando altitud de presión sin corregir (barométrica).',
            // *** Tooltips de las secciones ***
            'spatial_tooltip': 'Mostrar u ocultar datos espaciales: velocidad sobre el suelo, altitud, posición y distancia.',
            'signal_tooltip': 'Mostrar u ocultar detalles de señal como RSSI, tasa de mensajes, total de mensajes, última posición y último visto.',
            'fms_tooltip': 'Mostrar u ocultar configuraciones FMS seleccionadas: altitud seleccionada y rumbo seleccionado.',
            'wind_tooltip': 'Mostrar u ocultar datos de viento: velocidad, dirección (desde) y temperaturas (TAT/OAT).',
            'speed_tooltip': 'Mostrar u ocultar datos de velocidad: velocidad sobre el suelo, velocidad verdadera, velocidad indicada y número Mach.',
            'altitude_tooltip': 'Mostrar u ocultar detalles de altitud: barométrica, geométrica, tasas de ascenso/descenso y QNH.',
            'direction_tooltip': 'Mostrar u ocultar datos de dirección: rumbo de suelo, rumbo verdadero, rumbo magnético, declinación magnética, tasa de giro y alabeo.',
            'stuff_tooltip': 'Mostrar u ocultar datos varios de la aeronave como modos de navegación, versión ADS-B y categoría.',
            'accuracy_tooltip': 'Mostrar u ocultar indicadores de precisión e integridad: NACp, SIL, NACv, NIC_BARO, radio de contención (Rc) y época de posición.',
            'export_kml_tooltip': 'Exportar la posición actual de la aeronave a un archivo KML para visualización en aplicaciones de mapas. Elige la fuente de altitud: geométrica, geom_avg o barométrica.',

            // *** SETTINGS_INFOBLOCK ***
            // *** Encabezado ***
            'settings': 'Configuración',
            'reset_all_settings': 'Restablecer configuración',
            'restore_default_size': 'Restaurar tamaño predeterminado',
            'close': 'Cerrar',
            'text_icon_size': 'Tamaño de texto e iconos:',
            'icon_size_multiplier': 'Multiplicador de tamaño de iconos:',
            'reset_to_default_size': 'Restablecer al tamaño predeterminado',
            'reset_to_default_multiplier': 'Restablecer al multiplicador predeterminado',
            'reset': 'Restablecer',
            // *** UNITS ***
            'select_measurement_system': 'Seleccionar el sistema de medición',
            'aeronautical': 'Aeronáutico',
            'metric': 'Métrico',
            'imperial': 'Imperial',
            'reset_to_default': 'Restablecer',
            // *** Nombres de las categorías ***
            'units': 'UNIDADES',
            'display': 'PANTALLA',
            'filters_category': 'FILTROS',
            'data': 'DATOS',
            'system': 'SISTEMA',
            'information': 'INFORMACIÓN',
            // *** DISPLAY ***
            'colored_planes': 'Aviones coloreados',
            'colored_planes_tooltip': 'Muestra los marcadores de aeronaves en color en lugar de escala de grises.',
            'colored_trails': 'Rutas coloreadas',
            'colored_trails_tooltip': 'Muestra las rutas de aeronaves en color en lugar de escala de grises.',
            'altitude_chart': 'Gráfico de altitud coloreado',
            'altitude_chart_tooltip': 'Muestra un gráfico de perfil de altitud, mostrando la altitud con unidades y una leyenda de colores.',
            'dim_map': 'Oscurecer mapa',
            'dim_map_tooltip': 'Alterna el oscurecimiento de las capas del mapa para mejorar la visibilidad de las superposiciones.',
            'label_units': 'Unidades en etiquetas',
            'label_units_tooltip': 'Muestra unidades (ft, kts, etc.) en las etiquetas.',
            'webgl': 'Canvas WebGL',
            'webgl_tooltip': 'Usa WebGL para mostrar los iconos de aeronaves. Esto puede mejorar significativamente el rendimiento, especialmente cuando se muestran muchas aeronaves, pero puede causar problemas en algunos dispositivos/navegadores.',
            // *** FILTERS ***
            'ground_vehicles': 'Vehículos terrestres',
            'ground_vehicles_tooltip': 'Muestra vehículos de servicios terrestres que emiten señal ADS-B.',
            'non_icao_targets': 'Objetivos no-ICAO (rastro radar / fuselaje desconocido)',
            'non_icao_targets_tooltip': 'Muestra aeronaves que no tienen un código ICAO estándar o cuya estructura de fuselaje es desconocida.',
            'hide_aircraft_functions': 'Ocultar funciones de aeronaves',
            'hide_aircraft_functions_tooltip': 'Oculta el menú desplegable de acciones de aeronaves y deshabilita controles específicos (selección, seguimiento, bloque de información y funciones relacionadas).',
            'hide_elevation_function': 'Ocultar función de elevación',
            'hide_elevation_function_tooltip': 'Oculta la función para dibujar la elevación de terreno entre dos puntos.',
            'hide_distance_functions': 'Ocultar funciones de distancia',
            'hide_distance_functions_tooltip': 'Oculta el menú desplegable de medición y deshabilita todas las herramientas de distancia (aeronave-aeronave, punto en tierra-aeronave, punto en tierra-punto en tierra).',
            'hide_label_functions': 'Ocultar funciones de etiquetas',
            'hide_label_functions_tooltip': 'Oculta los controles de etiquetas y deshabilita las etiquetas de aeronaves y configuraciones relacionadas (etiquetas en vivo/históricas, unidades y formato).',
            'hide_layer_functions': 'Ocultar funciones de capas',
            'hide_layer_functions_tooltip': 'Oculta los controles de capas y previene cambios o interacciones con las capas del mapa y configuraciones de superposición (capas base, superposiciones y selector de capas).',
            'hide_recenter_function': 'Ocultar función de re-centrar',
            'hide_recenter_function_tooltip': 'Oculta el control de re-centrar y deshabilita el re-centrado manual del mapa a la ubicación del sitio.',
            'hide_replay_function': 'Ocultar función de reproducción',
            'hide_replay_function_tooltip': 'Oculta los controles de reproducción y deshabilita la reproducción de la línea de tiempo y controles relacionados (reproducir, pausar).',
            'hide_track_functions': 'Ocultar funciones de ruta',
            'hide_track_functions_tooltip': 'Oculta los controles de rutas y previene el dibujo o interacción con las rutas de aeronaves y características relacionadas.',
            'hide_zoom_functions': 'Ocultar funciones de zoom',
            'hide_zoom_functions_tooltip': 'Oculta los controles de zoom y deshabilita el zoom del mapa.',
            // *** DATA ***
            'baro_alt_correct_qnh': 'Alt. baro.: corregir por QNH',
            'baro_alt_correct_qnh_tooltip': 'Ajusta la altitud de presión según la presión atmosférica local (QNH) para mostrar la altitud real sobre el nivel del mar.',
            'geom_alt_wgs84_egm': 'Alt. geom.: conversión WGS84 -> EGM (carga larga)',
            'geom_alt_wgs84_egm_tooltip': 'Aplica una corrección matemática para hacer que la altitud GPS sea más precisa relativa al nivel del mar (tarda más en cargar).',
            'historic_track_labels_utc': 'Etiquetas de ruta históricas: UTC',
            'historic_track_labels_utc_tooltip': 'Cuando está activado con Herramientas de Ruta > Etiquetas de Ruta, muestra marcas de tiempo en UTC en lugar de hora local.',
            'labels_geom_alt': 'Etiquetas: alt. geom. (WGS84)',
            'labels_geom_alt_tooltip': 'Cuando está activado con Herramientas de Etiquetas > Etiquetas de Ruta, muestra altitud geométrica (GPS) en lugar de altitud barométrica estándar.',
            'live_track_labels_utc': 'Etiquetas de ruta en vivo: UTC',
            'live_track_labels_utc_tooltip': 'Cuando está activado con Herramientas de Ruta > Etiquetas de Ruta, muestra marcas de tiempo en rutas en vivo usando Tiempo Universal (UTC).',
            'notable_aircraft': 'Aeronaves destacadas',
            'notable_aircraft_tooltip': 'Activar/desactivar la función de aeronaves destacadas. Permite marcar aeronaves como destacadas y mostrarlas en la barra lateral.',
            // *** SYSTEM ***
            'auto_select_plane': 'Seleccionar avión automáticamente',
            'auto_select_plane_tooltip': 'Selecciona automáticamente la aeronave más cercana al centro del mapa cada 5 segundos. Solo considera aeronaves con posición reciente (vistas en los últimos 20 segundos).',
            'debug_show_all': 'Debug mostrar todo',
            'debug_show_all_tooltip': 'Muestra toda la información de depuración.',
            'debug_tracks': 'Debug rutas',
            'debug_tracks_tooltip': 'Cuando está activado con Herramientas de Ruta > Todas las Rutas, muestra información detallada de ruta en la consola.',
            'hide_all_tooltips': 'Ocultar todas las sugerencias',
            'hide_all_tooltips_tooltip': 'Oculta las sugerencias de todos los elementos en toda la página (elimina/restaura atributos title).',
            'hide_settings_tooltips': 'Ocultar sugerencias de configuración',
            'hide_settings_tooltips_tooltip': 'Oculta las sugerencias de los controles dentro del menú de configuración.',
            'include_filters_in_urls': 'Incluir filtros en URLs',
            'include_filters_in_urls_tooltip': 'Incluye la configuración de filtros actual en la URL.',
            'update_gps_location': 'Actualizar ubicación GPS',
            'update_gps_location_tooltip': 'Actualiza la ubicación GPS del navegador/dispositivo y habilita el seguimiento periódico para centrar el mapa; requiere permiso del navegador.',
            // *** INFORMATION ***
            'enable_infoblock': 'Activar bloque de información',
            'enable_infoblock_tooltip': 'Muestra el bloque de información con detalles de la aeronave seleccionada.',
            'enable_mouseover_block': 'Activar bloque al pasar el mouse',
            'enable_mouseover_block_tooltip': 'Muestra información detallada de la aeronave seleccionada al pasar el mouse sobre ella.',
            'lookup_route': 'Buscar ruta',
            'lookup_route_tooltip': 'Busca la ruta de la aeronave (aeropuertos de origen y destino) usando una API en línea (si está disponible).',
            'pictures_planespotting_be': 'Imágenes planespotting.be',
            'pictures_planespotting_be_tooltip': 'Muestra imágenes de planespotting.be (si están disponibles).',
            'pictures_planespotters_net': 'Imágenes planespotters.net',
            'pictures_planespotters_net_tooltip': 'Muestra imágenes de planespotters.net (si están disponibles).',
            'wide_infoblock': 'Bloque de información ancho',
            'wide_infoblock_tooltip': 'Usa un diseño más ancho para el bloque de información, permitiendo mostrar más información en una sola línea.',
            // *** reset-all-settings-btn ***
            'reset_all_settings': 'Restablecer configuración',
            'reset_all_settings_confirm': 'Esto restaurará toda la configuración a sus valores predeterminados.',
            'reset_all_settings_reload': 'La página se recargará para aplicar los cambios.',
            'cancel': 'Cancelar',
            'reset_reload': 'Restablecer y Recargar',
            'error_connect_server': '¡No se puede conectar al servidor, verifica tu red!',
            'error_data_not_updated': 'Los datos del servidor no se han actualizado en un tiempo.',

            // *** NAVBAR ***
            'utc': 'UTC',
            'utc_tooltip': 'Hora UTC actual - Tiempo Universal Coordinado.',
            'zoom_tooltip': 'Zoom',
            'zoom_tooltip_text': 'Nivel de zoom actual: {zoom} ({pct}% relativo al zoom base {baseline})',
            'search_placeholder': 'Buscar aviones, aeropuertos...',
            'search_tooltip': 'Usa coordenadas decimales (lat,lon) para buscar aeropuertos. Usa hex ICAO24 o indicativo para buscar vuelos.',
            'open_sidebar': 'Abrir barra lateral',
            'toggle_sidebar': 'Alternar barra lateral',

            // *** HEADER_SIDE ***
            // *** aircraft_dropdown ***
            'aircraft_tools': 'Herramientas de aeronaves',
            'aircraft_tools_tooltip': 'Herramientas de aeronaves - Abre opciones de filtrado y seguimiento.',
            'current_view': 'Vista actual',
            'current_view_tooltip': 'Mostrar solo aeronaves visibles actualmente en el mapa.',
            'multi_select': 'Selección múltiple',
            'multi_select_tooltip': 'Activar selección de múltiples aeronaves al mismo tiempo.',
            'persistence': 'Persistencia',
            'persistence_tooltip': 'Mantener posiciones históricas visibles por un corto período.',
            'isolate': 'Aislar',
            'isolate_tooltip': 'Mostrar solo la aeronave seleccionada y ocultar el resto.',
            'military_only': 'Solo militares',
            'military_only_tooltip': 'Mostrar solo aeronaves identificadas como militares.',
            'follow': 'Seguir',
            'follow_tooltip': 'Mantener la aeronave seleccionada centrada en el mapa.',
            // *** measurement_dropdown ***
            'measurement_tools': 'Herramientas de medición',
            'measurement_tools_tooltip': 'Herramientas de medición - Abre opciones de medición.',
            'aircraft_aircraft': 'Aeronave-aeronave',
            'aircraft_aircraft_tooltip': 'Medir distancia entre dos aeronaves.',
            'ground_point_aircraft': 'Punto en tierra-aeronave',
            'ground_point_aircraft_tooltip': 'Medir distancia desde un punto en tierra a una aeronave.',
            'ground_point_ground_point': 'Punto en tierra-punto en tierra',
            'ground_point_ground_point_tooltip': 'Medir distancia entre dos puntos en tierra.',
            // *** track_dropdown ***
            'track_tools': 'Herramientas de ruta',
            'track_tools_tooltip': 'Herramientas de ruta - Abre opciones de visualización de rutas.',
            'all_tracks': 'Todas las rutas',
            'all_tracks_tooltip': 'Mostrar rutas de todas las aeronaves visibles.',
            'track_labels': 'Etiquetas de ruta',
            'track_labels_tooltip': 'Mostrar u ocultar etiquetas en las rutas de aeronaves.',
            // *** label_dropdown ***
            'label_tools': 'Herramientas de etiquetas',
            'label_tools_tooltip': 'Herramientas de etiquetas - Abre opciones de visibilidad de etiquetas.',
            'labels': 'Etiquetas',
            'labels_tooltip': 'Mostrar u ocultar etiquetas principales de aeronaves.',
            'label_details': 'Detalles de etiqueta',
            'label_details_tooltip': 'Mostrar u ocultar información extendida de etiquetas.',

            'expand_sidebar': 'Expandir barra lateral',
            'settings_tooltip': 'Abrir preferencias de la aplicación y opciones de pantalla.',
            'recenter_tooltip': 'Re-centrar el mapa y restaurar la vista predeterminada.',
            'replay_tooltip': 'Abrir controles de reproducción para vuelos históricos.',
            'zoom_in_tooltip': 'Acercar - Aumentar el nivel de zoom del mapa.',
            'zoom_out_tooltip': 'Alejar - Disminuir el nivel de zoom del mapa.',

            // *** PANORAMA-OVERLAY ***
            'elevation_tooltip': 'Mostrar la elevación del terreno existente entre dos puntos.',
            'wait_for_elevation': 'Espere a que la elevación termine de dibujarse...',
            'building_elevation': 'Generando elevación...',
            'no_data': 'Sin datos de relieve para dibujar.',
            'data_error': 'Error en batch elevation:',
            'elevation_mark_point_a': 'Haz clic en el mapa para marcar el punto A.',
            'elevation_mark_point_b': 'Ahora, haz clic en el mapa nuevamente para marcar el punto B.',
            'layer_group_elevation_tool': 'Herramienta de elevación',
            'layer_elev_points': 'Puntos A-B en tierra',
            'layer_elev_line': 'Línea A-B',

            // *** REPLAY ***
            'play': 'Reproducir',
            'pause': 'Pausar',
            'date_label': 'Fecha',
            // 'utc_label': 'UTC:',
            'playback_label': 'Reproducción',
            'hours_label': 'Horas',
            'minutes_label': 'Minutos',
            'speed_label': 'Velocidad',
            'loading': 'Cargando...',
            'replay_placeholder': 'Seleccione una fecha para reproducir...',

            // *** SIDEBAR_CONTAINER ***
            'toggle_sidebar': 'Alternar barra lateral',
            'show_map': 'Mostrar mapa',
            'control_sidebar_width': 'Controlar el ancho de la barra lateral.',
            'total_aircraft': 'Total Aeronaves:',
            'messages': 'Mensajes:',
            'per_sec': '/seg',
            'with_position': 'Con Posición:',
            'history': 'Historial:',
            'positions': 'posiciones',
            'altimeter': 'Altímetro:',
            'set': 'Establecer',
            'standard': 'Estándar',
            'from_plane': 'Desde Avión',
            'improve_coverage': 'Mejorar Cobertura:',
            'faq': 'Preguntas Frecuentes',
            'map_help': 'Ayuda del Mapa',
            'adsb_feeder_config': 'Configuración de Imagen del Alimentador ADSB',
            // *** tabs ***
            'filter_flights_tooltip': 'Filtrar vuelos por criterios específicos.',
            'filters': 'Filtros',
            'select_columns_tooltip': 'Seleccionar qué columnas mostrar en la tabla de aeronaves.',
            'columns': 'Columnas',
            'restore_sidebar_tooltip': 'Restaurar el ancho del sidebar a su valor predeterminado.',
            'restore': 'Restaurar',
            'filter_by_altitude': 'Filtrar por altitud:',
            'to': 'a',
            'filter': 'Filtrar',
            'reset': 'Restablecer',
            'filter_by_source': 'Filtrar por fuente:',
            'filter_by_db_flags': 'Filtrar por banderas DB:',
            'clear': 'Limpiar',
            'search_flight_placeholder': 'Buscar por indicativo, squawk o hex ICAO...',
            'search_type_placeholder': 'Buscar por código de tipo, descripción o categoría...',
            'search_reg_placeholder': 'Buscar por matrícula, ruta o país...',
            'min_ft': 'Mín ft',
            'max_ft': 'Máx ft',
            'filter_flight': 'Vuelo',
            'filter_aircraft_type': 'Tipo de aeronave',
            'filter_registration_route': 'Matrícula y ruta',
            'filter_source': 'Fuente',
            'filter_db_flags': 'Banderas DB',
            'filter_altitude': 'Altitud',
            'clear': 'Limpiar',
            'apply': 'Aplicar',
            'reset': 'Restablecer',
            'restore_default_columns': 'Restaurar columnas predeterminadas',
            'error_min_alt_greater': 'ERROR: La altitud mínima ({min}) no puede ser mayor que la máxima ({max}). Por favor, corrige los valores.',
            'no_limit': 'sin límite',
            'altitude_filter_active': '✓ Filtro de altitud activo:',
            // *** planesTable ***
            'active_columns': 'Columnas activas',
            'inactive_columns': 'Columnas inactivas',
            'col_icao': 'ID Hex',
            'col_country': 'Bandera',
            'col_flight': 'Indicativo',
            'col_route': 'Ruta',
            'col_registration': 'Matrícula',
            'col_type': 'Tipo',
            'col_squawk': 'Squawk',
            'col_altitude': 'Alt.',
            'col_speed': 'Vel.',
            'col_sitedist': 'Dist.',
            'col_track': 'Rumbo',
            'col_msgs': 'Mensajes',
            'col_seen': 'Visto',
            'col_rssi': 'RSSI',
            'col_lat': 'Latitud',
            'col_lon': 'Longitud',
            'col_data_source': 'Fuente',
            'col_military': 'Mil.',
            'col_wd': 'Viento D.',
            'col_ws': 'Viento V.',
            'col_vert_rate': 'Raz. V.',
            'unit_ft': 'ft',
            'unit_kt': 'kt',
            'unit_nm': 'MN',

            'more_table_lines': 'Más líneas en tabla',
            'even_more_table_lines': 'Aún más líneas',
            'all_table_lines': 'Todas las líneas',
            'more_table_lines_tooltip': 'Aumenta el número de aeronaves mostradas en la tabla.',
            'even_more_table_lines_tooltip': 'Aumenta aún más el número de aeronaves mostradas en la tabla.',
            'all_table_lines_tooltip': 'Mostrar todas las aeronaves en la tabla (puede afectar el rendimiento).',
            'table_display_options': 'Opciones de visualización de tabla',

            'aircraft_list': 'Lista de Aeronaves',

            // *** starred-aircraft-section ***
            'notable_aircraft': 'Aeronaves destacadas',
            'no_marked_planes': 'No hay aviones marcados',
            'clear_all_notable': 'Limpiar todas las aeronaves destacadas',

            'error_fetching_data': 'Problema al obtener datos del servidor:',

            // *** FUNCIONES DE DISTANCIA ***
            'signal_lost': 'SEÑAL PERDIDA',
            'retrying': 'Reintentando...',
            'dist_label': 'Distancia:',
            'alt_diff_label': 'Dif. Alt.:',
            'nm': 'NM',
            'ft': 'ft',
            'mode_label': 'Modo',
            'distance_label': 'Distancia:',
            // *** Aeronave-Aeronave ***
            '1_aircraft_1_aircraft': 'Modo 1 Aeronave - 1 Aeronave',
            'select_aircraft_valid_position': 'Selecciona una aeronave con posición válida.',
            'select_aircraft_complete_pair': 'Selecciona una aeronave para completar el par.',
            'pairs_mode': 'Modo Pares',
            // 'click_two_aircraft_measure': 'Haz clic en dos aeronaves para medir la distancia.',
            'distance_select_plane_a': 'Haz clic en una aeronave para marcar el punto A.',
            'distance_select_plane_b': 'Haz clic en otra aeronave para marcar el punto B.',
            'distance_invalid_aircraft': 'Selecciona una aeronave.',
            'click_two_aircraft_sequence': 'Haz clic en dos aeronaves en secuencia para crear pares independientes (A-B, C-D), o haz clic dos veces en una aeronave para anclarla y luego selecciona múltiples puntos B.',
            'first_selected': 'Primero seleccionado. Haga clic en otro avión para formar un par, o haga clic en este avión nuevamente para anclarlo.',
            'anchor_aircraft': 'Avión anclado. Ahora haga clic en un avión B para crear pares con A. Haga clic en A nuevamente para desanclar.',
            'pair_already_exists': 'El par ya existe.',
            'independent_pair_added': 'Par independiente añadido.',
            'anchor_disabled': 'Anclaje desactivado.',
            'pair_added': 'Par añadido.',
            'anchor_lost': 'El avión ancla ha perdido señal. Selecciona un nuevo ancla o haz clic en dos aviones para formar pares.',
            // *** Tierra-Aeronave ***
            'ta_click_map_point_a': 'Haz clic en el mapa para marcar el punto A.',
            'ta_click_map_single_point_a': 'Haz clic en el mapa para marcar un único punto A.',
            'ta_click_map_multiple_points_a': 'Haz clic en el mapa para marcar múltiples puntos A.',
            'ta_click_aircraft_point_b': 'Haz clic en una aeronave para marcar el punto B.',
            'ta_click_aircraft_multiple_points_b': 'Haz clic en una o más aeronaves para marcar múltiples puntos B.',
            'ta_click_aircraft_single_point_b': 'Haz clic en una aeronave para marcar un único punto B.',
            'ta_1_point_1_aircraft': 'Modo 1 Punto - 1 Aeronave',
            'ta_1_point_multiple_aircraft': 'Modo 1 Punto - Múltiples Aeronaves',
            'ta_multiple_points_1_aircraft': 'Modo Múltiples Puntos - 1 Aeronave',
            'ta_multiple_points_multiple_aircraft': 'Modo Múltiples Puntos - Múltiples Aeronaves',
            'first_mark_point_a': 'Primero marca el punto A.',
            'first_mark_at_least_one_point_a': 'Primero marca al menos un punto A.',
            // *** Tierra-Tierra ***
            'gg_1_point_1_point': 'Modo 1 Punto - 1 Punto',
            'gg_1_point_multiple_points': 'Modo 1 Punto - Múltiples Puntos',
            'gg_multiple_points_multiple_points': 'Modo Múltiples Puntos - Múltiples Puntos',
            'gg_click_map_point_b': 'Haz clic en el mapa para marcar el punto B.',
            'gg_click_map_multiple_points_b': 'Haz clic en el mapa para marcar múltiples puntos B.',

            // *** MENÚ DE CAPAS ***
            'layer_tools_title': 'Herramientas de capas',
            'layer_webgllayer': 'Pos. aeronave webGL',
            'layer_iconlayer': 'Etiqueta de aeronave',
            'layer_locationdot': 'Posición del sitio',
            'layer_sitecircles': 'Anillos de distancia',
            // *** Dropdown de distancia ***
            'layer_group_distance_tools': 'Herramientas de distancia',
            'layer_group_ground_point_ground_point': 'Punto en tierra-punto en tierra',
            'layer_groundtoground': 'Línea A-B',
            'layer_group_ground_point_aircraft': 'Punto en tierra-aeronave',
            'layer_groundtoplane': 'Línea A-B',
            'layer_groundpoint': 'Punto en tierra',
            'layer_group_aircraft_aircraft': 'Aeronave-aeronave',
            'layer_ggpoints': 'Puntos A-B en tierra',
            'layer_distancelines': 'Línea A-B',
            // *** Capas base IFR ***
            'layer_group_ifrhigh': 'IFR Alto',
            'layer_group_ifrlow': 'IFR Bajo',
            // *** Dropdown Worldwide ***
            'layer_group_world': 'Mundial',
            'layer_osm_tiles_offline': 'Mapa sin conexión',
            'layer_rainviewer_radar': 'Radar RainViewer',
            // *** Overlays IFR/VFR/TMA ***
            'layer_base': 'Base',
            'layer_map': 'Mapa',
            'layer_airports_aerodromes': 'Aeropuertos / Aeródromos',
            'layer_airspace_classes': 'Clases de Espacio Aéreo',
            'layer_airways_air_routes': 'Rutas Aéreas',
            'layer_controlled_airspace': 'Espacio Aéreo Controlado',
            'layer_grid_mora_mea': 'Cuadrícula MORA / MEA',
            'layer_navaids': 'Ayudas a la Navegación',
            'layer_obstacles': 'Obstáculos',
            'layer_political_boundaries': 'Límites Políticos',
            'layer_special_use_airspace': 'Espacio Aéreo de Uso Especial',
            'layer_terrain_topography': 'Terreno / Topografía',
            'layer_waypoints_fixes': 'Puntos de Navegación / Fijos',
            'layer_weather_radar': 'Clima / Radar',

            'elevation_ground_aircraft_tooltip': 'Mostrar la elevación del terreno desde un punto en tierra hasta una aeronave.',
            'hide_elevation_ground_aircraft_function': 'Ocultar función de elevación tierra-aeronave',
            'hide_elevation_ground_aircraft_function_tooltip': 'Ocultar el perfil de elevación desde un punto en tierra hasta una aeronave.',
            'elevation_mark_ground_point': 'Haz clic en el mapa para marcar el punto en tierra.',
            'elevation_mark_ground_first': 'Primero marca un punto en tierra.',
            'elevation_select_aircraft': 'Ahora haz clic en una aeronave.',
            'elevation_invalid_aircraft': 'La posición de la aeronave no está disponible.',
            'elevation_next_update': 'Próxima actualización en {seconds}s',
        }
    };
    // *****************************************
    // ********* FIN TRADUCCIONES **************
    // *****************************************

    // *****************************************
    // *** INICIO FUNCIONES DE TRADUCCIÓN ******
    // *****************************************
    const DEFAULT_LANG = 'es';
    let currentLang = localStorage.getItem('app_lang');

    if (!currentLang) {
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang && browserLang.startsWith('es')) {
            currentLang = 'es';
        } else {
            currentLang = DEFAULT_LANG;
        }
        localStorage.setItem('app_lang', currentLang);
    }

    function t(key) {
        const translation = translations[currentLang]?.[key];
        return translation !== undefined ? translation : key;
    }

    function setLang(lang) {
        if (translations[lang]) {
            currentLang = lang;
            localStorage.setItem('app_lang', lang);

            if (typeof updateUI === 'function') {
                updateUI();
            }

            setTimeout(function () {
                if (typeof window.updateDistanceGuideContent === 'function') {
                    window.updateDistanceGuideContent();
                }
            }, 50);

            if (typeof window.updateLayerTitles === 'function') {
                const attempts = [100, 300, 600, 1000];
                attempts.forEach(delay => {
                    setTimeout(function () {
                        window.updateLayerTitles();
                    }, delay);
                });
            }

            if (typeof window.updateLayerToolsTitle === 'function') {
                setTimeout(function () {
                    window.updateLayerToolsTitle();
                }, 150);
            }

            if (typeof window.updateAllLanguage === 'function') {
                setTimeout(function () {
                    window.updateAllLanguage();
                }, 150);
            }

            if (lastPanoramaData && lastPanoramaTotalNm != null) {
                setTimeout(function () {
                    if (typeof draw3DPanorama === 'function') {
                        draw3DPanorama(lastPanoramaData, lastPanoramaTotalNm);
                    }
                }, 200);
            }

            document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
            return true;
        }
        return false;
    }

    function t_html(key) {
        const translation = translations[currentLang]?.[key];
        return translation !== undefined ? translation : key;
    }

    document.addEventListener('languageChanged', function (e) {
        setTimeout(function () {
            if (typeof window.updateDistanceGuideContent === 'function') {
                window.updateDistanceGuideContent();
            }
        }, 50);
    });

    function getLang() {
        return currentLang;
    }
    // *****************************************
    // ***** FIN FUNCIONES DE TRADUCCIÓN *******
    // *****************************************

    // ***********************************************************
    // ** INICIO FUNCIÓN OBTENER TRADUCCIÓN DE TÍTULOS DE CAPAS **
    // ***********************************************************
    function getLayerTitle(layerName, defaultTitle) {
        let key = 'layer_' + layerName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const translation = translations[currentLang]?.[key];
        if (translation !== undefined) {
            return translation;
        }
        return defaultTitle || layerName;
    }
    window.getLayerTitle = getLayerTitle;
    // ***********************************************************
    // *** FIN FUNCIÓN OBTENER TRADUCCIÓN DE TÍTULOS DE CAPAS ****
    // ***********************************************************

    // *****************************************
    // ****** INICIO ACTUALIZACIÓN DE UI *******
    // *****************************************
    function updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = t(key);
            if (text !== key) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = text;
                } else {
                    el.textContent = text;
                }
            }
        });

        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const text = t(key);
            if (text !== key) {
                el.title = text;
            }
        });

        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            const text = t(key);
            if (text !== key) {
                el.innerHTML = text;
            }
        });

        document.querySelectorAll('[data-i18n-meta]').forEach(el => {
            const key = el.getAttribute('data-i18n-meta');
            const text = t(key);
            if (text !== key) {
                el.content = text;
            }
        });
    }
    // *****************************************
    // ******* FIN ACTUALIZACIÓN DE UI *********
    // *****************************************

    // *****************************************
    // ******* INICIO SELECTOR DE IDIOMA *******
    // *****************************************
    function addLanguageSelector() {
        if (document.getElementById('language_selector_patch')) return;

        const unitsContainer = document.getElementById('category-units-container');
        if (!unitsContainer) return;

        const selectorHTML = `
            <div class="settingsOptionContainer" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(128,128,128,0.2);">
                <select id="language_selector_patch" class="units-select" style="min-width: 140px;">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                </select>
            </div>
        `;

        unitsContainer.insertAdjacentHTML('beforeend', selectorHTML);

        const selector = document.getElementById('language_selector_patch');
        if (selector) {
            selector.value = currentLang;
            selector.addEventListener('change', function () {
                setLang(this.value);
            });
        }
    }
    // *****************************************
    // ******** FIN SELECTOR DE IDIOMA *********
    // *****************************************

    // *****************************************
    // ** INICIO INICIALIZACIÓN DE LA FUNCIÓN **
    // *****************************************
    function initLanguagePatch() {
        updateUI();
        addLanguageSelector();
    }

    window.translate = { t, setLang, getLang, updateUI };
    window.__ = t;
    window.setLanguage = setLang;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanguagePatch);
    } else {
        initLanguagePatch();
    }
    // *****************************************
    // *** FIN INICIALIZACIÓN DE LA FUNCIÓN ****
    // *****************************************

    // ****************************************************
    // ** INICIO INICIALIZACIÓN DE FUNCIÓN DE TRADUCCIÓN **
    // ****************************************************
    function getTranslatedText(key, fallback, allowHtml = false) {
        const translation = translations[currentLang]?.[key];
        if (translation !== undefined) {
            return translation;
        }
        return fallback || key;
    }

    window.getTranslatedText = getTranslatedText;

    window.translate = {
        t: t,
        setLang: setLang,
        getLang: getLang,
        updateUI: updateUI,
        getTranslatedText: getTranslatedText,
        getLayerTitle: window.getLayerTitle || function (name, fallback) {
            const key = 'layer_' + name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
            const translation = translations[currentLang]?.[key];
            return translation !== undefined ? translation : (fallback || name);
        }
    };
    // ****************************************************
    // *** FIN INICIALIZACIÓN DE FUNCIÓN DE TRADUCCIÓN ****
    // ****************************************************
})();