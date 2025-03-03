INSERT INTO
    `billableServices` (`id`, `name`, `code`)
VALUES (1, 'siapa', '16970030653705'),
    (2, 'siapa', '16970031513707'),
    (3, 'siapa', '16970020313698'),
    (4, 'siapa', '16970023653700');

INSERT INTO
    `cronjobs` (
        `id`,
        `name`,
        `schedule`,
        `status`,
        `type`,
        `command`,
        `created_at`,
        `executed_at`
    )
VALUES (
        1,
        'Cancel invoices',
        '0 0 1 * *',
        'active',
        'cron',
        'cancelExpiredBillings',
        '2024-10-21 02:51:15',
        '2025-03-01 15:13:27'
    ),
    (
        2,
        'Resume of the week',
        '0 0 * * 0',
        'active',
        'cron',
        'mailResumeOfTheWeek',
        '2024-10-21 02:51:22',
        '2025-02-24 15:16:32'
    ),
    (
        3,
        'Payment Remainder',
        '0 0 */15 * *',
        'active',
        'cron',
        'sendPaymentRemainder',
        '2024-12-01 00:56:19',
        '2025-03-01 15:12:05'
    );

INSERT INTO
    `employees` (
        `id`,
        `bas_id`,
        `name`,
        `email`,
        `phone`,
        `pto_days`,
        `rfc`,
        `created_at`,
        `updated_at`
    )
VALUES (
        1,
        0,
        'Ramiro Nuñez Santillan',
        'ramiro@surtidoraferreteramexicana.com',
        '333333333',
        12,
        'XAXX010101000',
        '2024-09-22 04:52:40',
        '2024-09-22 04:52:40'
    ),
    (
        2,
        10000,
        'Cassandra',
        'cassandra@surtidoraferreteramexicana.com',
        '333333333',
        12,
        'XAXX010101000',
        '2024-09-22 04:59:42',
        '2024-09-22 04:59:42'
    ),
    (
        3,
        10001,
        'Martin',
        'martin@surtidoraferreteramexicana.com',
        '333333333',
        12,
        'XAXX010101000',
        '2024-09-22 04:59:42',
        '2024-09-22 04:59:42'
    ),
    (
        4,
        10002,
        'Rafael Martinez',
        'lourdes@surtidoraferreteramexicana.com',
        '333333333',
        12,
        'XAXX010101000',
        '2024-09-22 04:59:42',
        '2024-09-22 04:59:42'
    ),
    (
        5,
        10003,
        'Beatriz',
        'beatriz@surtidoraferreteramexicana.com',
        '333333333',
        12,
        'XAXX010101000',
        '2024-09-22 04:59:42',
        '2024-09-22 04:59:42'
    ),
    (
        6,
        10004,
        'Lupe',
        'lupe@surtidoraferreteramexicana.com',
        '333333333',
        12,
        'XAXX010101000',
        '2024-09-22 04:59:42',
        '2024-09-22 04:59:42'
    );

INSERT INTO
    `inventory` (
        `id`,
        `external_id`,
        `type`,
        `quantity`,
        `created_at`,
        `description`
    )
VALUES (
        8,
        2,
        'product',
        4500,
        '2023-07-12 14:51:38',
        ''
    );

INSERT INTO
    `knex_migrations_lock` (`index`, `is_locked`)
VALUES (1, 0);

INSERT INTO
    `link` (
        `id`,
        `middleman_id`,
        `client_id`
    )
VALUES (6, '38', '110');

INSERT INTO
    `materials` (
        `id`,
        `name`,
        `description`,
        `unit`,
        `created_at`,
        `provider_id`,
        `price`
    )
VALUES (
        1,
        'Lamina calibre 14',
        'Lamina calibre 14',
        'g',
        '2024-07-22 04:46:36',
        NULL,
        0.023
    ),
    (
        2,
        'Lamina calibre 16',
        'Lamina calibre 16',
        'g',
        '2024-07-22 04:46:45',
        NULL,
        0.025
    ),
    (
        3,
        'Lamina calibre 20 negra acerada',
        'Lamina calibre 20 negra acerada',
        'g',
        '2024-07-22 04:47:31',
        NULL,
        0.025
    ),
    (
        4,
        'Balines de plastico',
        'Balines de plastico',
        'g',
        '2024-07-24 02:27:33',
        NULL,
        0.000
    ),
    (
        5,
        'Calibre 24',
        'Calibre 24',
        'g',
        '2024-08-04 04:09:22',
        NULL,
        0.025
    ),
    (
        6,
        'Calibre 30',
        'Calibre 30',
        'g',
        '2024-08-04 04:09:42',
        NULL,
        0.000
    ),
    (
        7,
        'Calibre 23',
        'Calibre 23',
        'g',
        '2024-08-04 04:10:06',
        NULL,
        0.000
    ),
    (
        8,
        'Calibre 26',
        'Calibre 26',
        'g',
        '2024-08-04 04:10:27',
        NULL,
        0.000
    ),
    (
        9,
        'Calibre 18',
        'Calibre 18',
        'g',
        '2024-08-04 04:10:44',
        NULL,
        0.000
    ),
    (
        10,
        'Calibre 20',
        'Calibre 20',
        'g',
        '2024-08-05 22:34:46',
        NULL,
        0.000
    ),
    (
        11,
        'Varilla 1/4 x 6”',
        'Varilla 1/4 x 6”',
        'g',
        '2024-08-05 22:35:26',
        NULL,
        0.000
    ),
    (
        12,
        'Varilla 1/4 x 7”',
        'Varilla 1/4 x 7”',
        'g',
        '2024-08-05 22:35:32',
        NULL,
        0.000
    ),
    (
        13,
        'Varilla 1/4 x 9”',
        'Varilla 1/4 x 9”',
        'g',
        '2024-08-05 22:35:46',
        NULL,
        0.000
    ),
    (
        14,
        'Calibre 22',
        'Calibre 22',
        'g',
        '2024-08-07 18:08:08',
        NULL,
        0.026
    ),
    (
        15,
        'Lámina inoxidable calibre 24',
        'Lámina inoxidable calibre 24',
        'g',
        '2024-08-08 18:41:26',
        NULL,
        0.000
    ),
    (
        16,
        'calibre 18 blanda',
        'calibre 18 blanda',
        'g',
        '2024-10-12 20:24:28',
        NULL,
        0.000
    );

INSERT INTO
    `materials_price_list` (
        `id`,
        `price`,
        `material_id`,
        `provider_id`,
        `created_at`,
        `updated_at`
    )
VALUES (
        22,
        0.027,
        2,
        0,
        '2024-11-23 21:06:39',
        '2024-11-23 21:06:39'
    ),
    (
        23,
        0.025,
        3,
        0,
        '2024-11-27 02:13:44',
        '2024-11-27 02:13:44'
    ),
    (
        24,
        0.024,
        5,
        0,
        '2024-12-21 21:01:52',
        '2024-12-21 21:01:52'
    ),
    (
        25,
        0.024,
        2,
        0,
        '2024-12-21 21:04:32',
        '2024-12-21 21:04:32'
    ),
    (
        26,
        0.025,
        5,
        0,
        '2025-01-11 03:43:36',
        '2025-01-11 03:43:36'
    ),
    (
        27,
        0.025,
        2,
        0,
        '2025-01-11 03:43:47',
        '2025-01-11 03:43:47'
    ),
    (
        28,
        0.023,
        1,
        0,
        '2025-01-18 20:55:49',
        '2025-01-18 20:55:49'
    ),
    (
        17,
        0.020,
        5,
        0,
        '2024-11-04 01:33:20',
        '2024-11-04 01:33:20'
    ),
    (
        18,
        0.030,
        5,
        0,
        '2024-11-04 01:34:59',
        '2024-11-04 01:34:59'
    ),
    (
        19,
        0.020,
        1,
        0,
        '2024-11-04 23:02:04',
        '2024-11-04 23:02:04'
    ),
    (
        20,
        0.020,
        3,
        0,
        '2024-11-07 02:05:37',
        '2024-11-07 02:05:37'
    ),
    (
        21,
        0.029,
        1,
        0,
        '2024-11-09 23:56:09',
        '2024-11-09 23:56:09'
    );

INSERT INTO
    `middleman` (
        `bas_id`,
        `name`,
        `email`,
        `address`,
        `phone`,
        `rfc`,
        `bank_name`,
        `clabe`,
        `comission`
    )
VALUES (
        39,
        'Alejandro Anguiano Llamas',
        'j.alejandro.llamas@outlook.com',
        '',
        '33 2921 7648',
        'XAXX010101000',
        '',
        '',
        0.05
    ),
    (
        38,
        'Gloria Llamas',
        'gloria_llamas@hotmail.com',
        'calzalada de los Angeles ',
        '3336184554',
        'XAXX010101000',
        'bbva',
        'na',
        0.05
    );

INSERT INTO
    `orders` (
        `id`,
        `total`,
        `discount`,
        `subtotal`,
        `partial_payment`,
        `status`,
        `created_at`,
        `updated_at`,
        `client_id`,
        `billed`,
        `billed_at`,
        `payment_type`,
        `deleted_at`
    )
VALUES (
        2,
        379.25,
        0.00,
        379.25,
        379.25,
        'paid',
        '2023-04-18 22:38:41',
        '2023-04-18 22:38:41',
        23,
        NULL,
        NULL,
        '99',
        '0000-00-00 00:00:00'
    ),
    (
        3,
        511.00,
        0.00,
        511.00,
        511.00,
        'paid',
        '2023-04-18 22:58:32',
        '2023-04-18 22:58:32',
        12,
        NULL,
        NULL,
        '99',
        '0000-00-00 00:00:00'
    ),
    (
        4,
        392.00,
        0.00,
        392.00,
        392.00,
        'paid',
        '2023-04-19 21:36:20',
        '2023-04-19 21:36:20',
        12,
        NULL,
        NULL,
        '99',
        '0000-00-00 00:00:00'
    ),
    (
        18,
        312.00,
        0.00,
        312.00,
        312.00,
        'paid',
        '2023-04-25 16:43:20',
        '2023-04-25 16:43:20',
        20,
        NULL,
        NULL,
        '99',
        '0000-00-00 00:00:00'
    ),
    (
        6,
        114.48,
        0.00,
        114.48,
        114.48,
        'paid',
        '2023-04-21 21:37:06',
        '2023-04-21 21:37:06',
        0,
        NULL,
        NULL,
        '99',
        '0000-00-00 00:00:00'
    ),
    (
        7,
        722.00,
        0.00,
        722.00,
        722.00,
        'paid',
        '2023-04-21 21:47:35',
        '2023-04-21 21:47:35',
        12,
        NULL,
        NULL,
        '99',
        '0000-00-00 00:00:00'
    ),
    (
        16,
        211.00,
        0.00,
        211.00,
        211.00,
        'paid',
        '2023-04-24 18:27:52',
        '2023-04-24 18:27:52',
        55,
        NULL,
        NULL,
        '99',
        '0000-00-00 00:00:00'
    ),
    (
        9,
        1210.00,
        0.00,
        1210.00,
        1210.00,
        'paid',
        '2023-04-21 21:57:49',
        '2023-04-21 21:57:49',
        19,
        NULL,
        NULL,
        '99',
        '0000-00-00 00:00:00'
    ),
    (
        11,
        9620.00,
        0.00,
        9620.00,
        9620.00,
        'paid',
        '2023-04-21 22:15:08',
        '2023-04-21 22:15:08',
        17,
        NULL,
        NULL,
        '99',
        '0000-00-00 00:00:00'
    );

INSERT INTO
    `payments` (
        `id`,
        `client_id`,
        `external_id`,
        `payment_type`,
        `description`,
        `amount`,
        `payment_method`,
        `flow`,
        `created_at`,
        `updated_at`,
        `billing_id`
    )
VALUES (
        1,
        1,
        NULL,
        'bulk',
        '2notas',
        2966.00,
        1,
        'inflow',
        '2023-01-16 05:00:00',
        '2023-04-08 19:25:39',
        NULL
    ),
    (
        2,
        1,
        NULL,
        'bulk',
        '4notas',
        8236.00,
        1,
        'inflow',
        '2023-01-17 05:00:00',
        '2023-04-08 19:25:39',
        NULL
    );

INSERT INTO
    `payroll` (
        `id`,
        `name`,
        `salary_per_day`,
        `payment_method`,
        `status`,
        `account_number`,
        `bank_name`,
        `employee_id`,
        `work_week`
    )
VALUES (
        1,
        'Ramiro Nuñez Santillan',
        600.00,
        1,
        'active',
        '',
        '',
        1,
        5
    ),
    (
        2,
        'Cassandra',
        300.00,
        1,
        'active',
        NULL,
        NULL,
        2,
        5
    ),
    (
        3,
        'Martin',
        300.00,
        1,
        'active',
        NULL,
        NULL,
        3,
        5
    ),
    (
        4,
        'Rafael Martinez',
        400.00,
        1,
        'active',
        '',
        '',
        4,
        5
    ),
    (
        5,
        'Beatriz',
        333.33,
        1,
        'active',
        '',
        '',
        5,
        -17
    ),
    (
        6,
        'Lupe',
        316.66,
        1,
        'active',
        NULL,
        NULL,
        6,
        5
    );

INSERT INTO
    `process` (
        `id`,
        `product_id`,
        `quantity`,
        `unit`,
        `status`,
        `flow`,
        `created_at`
    )
VALUES (
        1,
        1,
        1.00,
        'kg',
        'onProcess',
        'outflow',
        '2023-09-15 22:04:12'
    );

INSERT INTO
    `products` (
        `id`,
        `name`,
        `price`,
        `gross_price`,
        `created_at`,
        `category`,
        `description`,
        `short_description`,
        `image`
    )
VALUES (
        1,
        'ABRAZADERA OMEGA DE 3/8',
        0.64,
        0.25,
        '2023-02-20 06:03:22',
        'abrazadera',
        '¡Abraza tus proyectos con nuestras Abrazaderas Omega de 3/8\"! Robustas, confiables y diseñadas para resistir cualquier desafío.',
        'Abrazadera Omega de 3/8\", fabricada en calibre 24, con una altura de 3/8\" y un ancho de 17mm.',
        'https://surtidoraferreteramexicana.com/wp-content/uploads/2024/04/abrazadera-omega-300x236-1.png'
    ),
    (
        2,
        'ABRAZADERA OMEGA DE 5/8',
        0.64,
        0.25,
        '2023-02-20 06:03:22',
        'abrazadera',
        '¡Consigue un agarre firme con nuestras Abrazaderas Omega de 5/8\"! La solución perfecta para tus necesidades de sujeción.',
        'Abrazadera Omega de 5/8\", fabricada en calibre 24, con una altura de 5/8\" y un ancho de 17mm.',
        'https://surtidoraferreteramexicana.com/wp-content/uploads/2024/04/abrazadera-omega-300x236-1.png'
    ),
    (
        3,
        'ABRAZADERA OMEGA DE 1/2',
        0.69,
        0.27,
        '2023-02-20 06:03:22',
        'abrazadera',
        '¡Potencia tus trabajos con nuestras Abrazaderas Omega de 1/2\"! Versátiles, duraderas y listas para cualquier tarea.',
        'Abrazadera Omega de 1/2\", fabricada en calibre 24, con una altura de 1/2\" y un ancho de 17mm.',
        'https://surtidoraferreteramexicana.com/wp-content/uploads/2024/04/abrazadera-omega-300x236-1.png'
    ),
    (
        4,
        'ABRAZADERA OMEGA DE 3/4',
        0.81,
        0.30,
        '2023-02-20 06:03:22',
        'abrazadera',
        '¡Haz que tus proyectos se destaquen con nuestras Abrazaderas Omega de 3/4\"! La elección preferida de los profesionales.',
        'Abrazadera Omega de 3/4\", fabricada en calibre 24, con una altura de 3/4\" y un ancho de 17mm.',
        'https://surtidoraferreteramexicana.com/wp-content/uploads/2024/04/abrazadera-omega-300x236-1.png'
    );

INSERT INTO
    `pto` (
        `id`,
        `employee_Id`,
        `pto_type`,
        `start_date`,
        `end_date`,
        `status`,
        `created_at`,
        `updated_at`
    )
VALUES (
        1,
        '6',
        '',
        '2024-08-05',
        '2024-08-09',
        'approved',
        '2024-10-21 05:21:06',
        '2024-10-21 05:21:06'
    ),
    (
        2,
        '2',
        '',
        '2024-06-10',
        '2024-06-15',
        'approved',
        '2024-10-26 21:15:10',
        '2024-10-26 21:15:10'
    ),
    (
        3,
        '1',
        '',
        '2024-06-10',
        '2024-06-15',
        'approved',
        '2024-10-26 21:17:28',
        '2024-10-26 21:17:28'
    ),
    (
        4,
        '1',
        '',
        '2024-12-23',
        '2024-12-28',
        'approved',
        '2024-12-21 21:06:00',
        '2024-12-21 21:06:00'
    );

INSERT INTO
    `recipes` (
        `id`,
        `product_id`,
        `material_id`,
        `quantity`,
        `created_at`
    )
VALUES (
        1,
        82,
        1,
        1000,
        '2024-07-27 20:14:12'
    ),
    (
        80,
        14,
        6,
        25,
        '2024-09-21 20:27:23'
    ),
    (
        10,
        3,
        5,
        7,
        '2024-08-07 17:17:37'
    ),
    (
        76,
        2,
        5,
        5,
        '2024-08-17 20:25:46'
    ),
    (
        75,
        1,
        5,
        5,
        '2024-08-17 20:25:27'
    ),
    (
        78,
        5,
        5,
        9,
        '2024-08-17 20:26:33'
    ),
    (
        15,
        4,
        5,
        8,
        '2024-08-07 17:29:52'
    ),
    (
        16,
        88,
        5,
        7,
        '2024-08-07 17:30:24'
    ),
    (
        17,
        67,
        5,
        20,
        '2024-08-07 17:30:51'
    ),
    (
        18,
        58,
        5,
        41,
        '2024-08-07 17:31:15'
    ),
    (
        19,
        57,
        5,
        34,
        '2024-08-07 17:33:07'
    ),
    (
        20,
        60,
        5,
        41,
        '2024-08-07 17:33:46'
    ),
    (
        21,
        61,
        5,
        80,
        '2024-08-07 17:34:27'
    ),
    (
        22,
        69,
        5,
        18,
        '2024-08-07 17:34:52'
    ),
    (
        23,
        55,
        5,
        24,
        '2024-08-07 17:40:20'
    ),
    (
        24,
        63,
        5,
        194,
        '2024-08-07 17:54:10'
    ),
    (
        25,
        62,
        5,
        117,
        '2024-08-07 17:54:35'
    ),
    (
        26,
        82,
        1,
        21,
        '2024-08-07 17:56:12'
    ),
    (
        27,
        82,
        1,
        21,
        '2024-08-07 17:56:35'
    ),
    (
        29,
        45,
        2,
        13,
        '2024-08-07 17:58:08'
    ),
    (
        30,
        47,
        2,
        17,
        '2024-08-07 17:58:29'
    ),
    (
        31,
        46,
        2,
        15,
        '2024-08-07 17:58:52'
    ),
    (
        32,
        48,
        2,
        20,
        '2024-08-07 17:59:36'
    ),
    (
        33,
        77,
        9,
        24,
        '2024-08-07 18:01:12'
    ),
    (
        34,
        73,
        9,
        85,
        '2024-08-07 18:01:30'
    ),
    (
        35,
        68,
        9,
        45,
        '2024-08-07 18:02:01'
    ),
    (
        36,
        105,
        9,
        36,
        '2024-08-07 18:02:22'
    ),
    (
        37,
        11,
        6,
        19,
        '2024-08-07 18:03:16'
    ),
    (
        38,
        13,
        6,
        26,
        '2024-08-07 18:03:39'
    ),
    (
        39,
        50,
        8,
        23,
        '2024-08-07 18:04:39'
    ),
    (
        40,
        52,
        8,
        44,
        '2024-08-07 18:05:04'
    ),
    (
        41,
        9,
        7,
        25,
        '2024-08-07 18:05:53'
    ),
    (
        42,
        10,
        7,
        34,
        '2024-08-07 18:06:18'
    ),
    (
        43,
        44,
        7,
        2,
        '2024-08-07 18:06:47'
    ),
    (
        44,
        6,
        14,
        19,
        '2024-08-07 18:09:02'
    ),
    (
        45,
        7,
        14,
        16,
        '2024-08-07 18:09:18'
    ),
    (
        46,
        8,
        14,
        22,
        '2024-08-07 18:09:38'
    ),
    (
        47,
        80,
        11,
        28,
        '2024-08-07 18:10:44'
    ),
    (
        48,
        79,
        13,
        41,
        '2024-08-07 18:12:11'
    ),
    (
        49,
        72,
        3,
        71,
        '2024-08-07 18:17:53'
    ),
    (
        50,
        64,
        5,
        35,
        '2024-08-08 18:25:05'
    ),
    (
        51,
        25,
        5,
        132,
        '2024-08-08 18:25:26'
    ),
    (
        52,
        26,
        5,
        118,
        '2024-08-08 18:25:41'
    ),
    (
        53,
        110,
        5,
        7,
        '2024-08-08 18:26:30'
    ),
    (
        54,
        27,
        5,
        107,
        '2024-08-08 18:33:29'
    ),
    (
        79,
        28,
        5,
        128,
        '2024-08-21 15:17:58'
    ),
    (
        56,
        12,
        4,
        10,
        '2024-08-08 18:34:51'
    ),
    (
        57,
        51,
        4,
        10,
        '2024-08-08 18:35:02'
    ),
    (
        58,
        14,
        4,
        18,
        '2024-08-08 18:35:19'
    ),
    (
        59,
        53,
        4,
        18,
        '2024-08-08 18:35:30'
    ),
    (
        60,
        54,
        4,
        18,
        '2024-08-08 18:36:09'
    ),
    (
        61,
        34,
        14,
        140,
        '2024-08-08 18:38:15'
    ),
    (
        62,
        35,
        14,
        130,
        '2024-08-08 18:38:43'
    ),
    (
        63,
        18,
        14,
        78,
        '2024-08-08 18:39:19'
    ),
    (
        64,
        65,
        14,
        68,
        '2024-08-08 18:40:03'
    ),
    (
        65,
        66,
        15,
        17,
        '2024-08-08 18:41:46'
    ),
    (
        66,
        56,
        15,
        26,
        '2024-08-08 18:42:09'
    ),
    (
        67,
        17,
        15,
        71,
        '2024-08-08 18:49:18'
    ),
    (
        68,
        36,
        3,
        270,
        '2024-08-08 19:05:21'
    ),
    (
        69,
        37,
        3,
        280,
        '2024-08-08 19:05:44'
    ),
    (
        70,
        89,
        3,
        48,
        '2024-08-08 19:22:44'
    ),
    (
        71,
        42,
        14,
        386,
        '2024-08-08 19:23:42'
    ),
    (
        72,
        43,
        14,
        516,
        '2024-08-08 19:24:01'
    ),
    (
        73,
        41,
        14,
        386,
        '2024-08-08 19:26:19'
    );