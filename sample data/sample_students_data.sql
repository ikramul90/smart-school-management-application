-- Sample data: 15 students per class (14 classes = 210 students)
-- Change table name `students` if yours is different

-- Play (class_id = 1)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(1, 1, 'Ayaan Rahman', 'AB+', NULL, 'Rafiq Tarek Rahman', 'Rumana Khatun', 'Rafiq Tarek Rahman', '01313389083', 'Tilagor, Sylhet', '2022-10-30', '20228637940265423', 1, 'Active', NULL),
(2, 2, 'Rokeya Rahman', 'A+', NULL, 'Imran Shamim Rahman', 'Anika Parvin', 'Imran Shamim Rahman', '01618495931', 'Shibganj, Sylhet', '2023-10-02', '20230341316475255', 1, 'Active', NULL),
(3, 3, 'Jannat Uddin', 'A-', NULL, 'Nasir Uddin', 'Tasfia Khatun', 'Nasir Uddin', '01450305641', 'Bondor Bazar, Sylhet', '2023-11-24', '20233953767242388', 1, 'Active', NULL),
(4, 4, 'Rubel Kabir', 'A+', NULL, 'Sabbir Kabir', 'Tasnia Khatun', 'Sabbir Kabir', '01912269166', 'Maulavi Bazar, Sylhet', '2023-02-16', '20239784801845146', 1, 'Active', NULL),
(5, 5, 'Arif Alam', 'O+', NULL, 'Anwar Alam', 'Rima Begum', 'Anwar Alam', '01488095701', 'Mirabazar, Sylhet', '2022-03-20', '20225430391171822', 1, 'Active', NULL),
(6, 6, 'Mizanur Islam', 'O+', NULL, 'Ridwan Fahim Islam', 'Shapla Parvin', 'Shapla Parvin', '01857871331', 'Zindabazar, Sylhet', '2023-07-24', '20235098393010310', 1, 'Active', NULL),
(7, 7, 'Siam Khan', 'B+', NULL, 'Hasan Habibur Khan', 'Tasfia Khatun', 'Hasan Habibur Khan', '01963116566', 'Shibganj, Sylhet', '2023-05-05', '20237010651333872', 1, 'Active', NULL),
(8, 8, 'Ayaan Sarker', 'A+', NULL, 'Kamal Rakib Sarker', 'Jahanara Begum', 'Jahanara Begum', '01932677360', 'Maulavi Bazar, Sylhet', '2022-02-17', '20222606474687234', 1, 'Active', NULL),
(9, 9, 'Puja Chowdhury', 'O+', NULL, 'Jamal Chowdhury', 'Salma Parvin', 'Salma Parvin', '01321913619', 'Tilagor, Sylhet', '2022-01-30', '20223990916998543', 1, 'Active', NULL),
(10, 10, 'Kamal Khan', 'AB+', NULL, 'Rubel Arif Khan', 'Nabila Akter', 'Rubel Arif Khan', '01711838425', 'Zindabazar, Sylhet', '2022-08-23', '20221354278498084', 1, 'Active', NULL),
(11, 11, 'Shapla Hossain', 'AB+', NULL, 'Imran Rayhan Hossain', 'Momena Akter', 'Imran Rayhan Hossain', '01948740164', 'Akhalia, Sylhet', '2023-04-15', '20230052427868011', 1, 'Active', NULL),
(12, 12, 'Sultana Hossain', 'O+', NULL, 'Liton Hossain', 'Momena Sultana', 'Momena Sultana', '01431586923', 'Subid Bazar, Sylhet', '2023-01-21', '20232260256342160', 1, 'Active', NULL),
(13, 13, 'Monir Miah', 'B+', NULL, 'Sajib Miah', 'Anika Akter', 'Sajib Miah', '01654145868', 'Mirabazar, Sylhet', '2022-01-13', '20225014294019655', 1, 'Active', NULL),
(14, 14, 'Abdul Rahman', 'B+', NULL, 'Siam Mizanur Rahman', 'Lubna Begum', 'Siam Mizanur Rahman', '01859514846', 'Maulavi Bazar, Sylhet', '2022-07-06', '20225648236629946', 1, 'Active', NULL),
(15, 15, 'Shapla Ali', 'B+', NULL, 'Fahim Tawhid Ali', 'Sadia Sultana', 'Fahim Tawhid Ali', '01589513433', 'Ambarkhana, Sylhet', '2023-03-28', '20232003791769367', 1, 'Active', NULL);

-- Nursery (class_id = 2)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(16, 1, 'Puja Ahmed', 'B+', NULL, 'Imran Ahmed', 'Ishrat Khatun', 'Imran Ahmed', '01917278895', 'Subid Bazar, Sylhet', '2022-01-26', '20227986872774348', 2, 'Active', NULL),
(17, 2, 'Tasfia Alam', 'O+', NULL, 'Salim Tarek Alam', 'Mim Akter', 'Salim Tarek Alam', '01623166587', 'Mendibag, Sylhet', '2021-03-12', '20216036690967054', 2, 'Active', NULL),
(18, 3, 'Ishrat Kabir', 'B+', NULL, 'Ayaan Kabir', 'Rumana Sultana', 'Ayaan Kabir', '01862729806', 'Tilagor, Sylhet', '2022-01-15', '20229901627204653', 2, 'Active', NULL),
(19, 4, 'Tasfia Choudhury', 'AB+', NULL, 'Tanvir Jahid Choudhury', 'Shirin Sultana', 'Tanvir Jahid Choudhury', '01300330923', 'Zindabazar, Sylhet', '2021-06-29', '20212719374529912', 2, 'Active', NULL),
(20, 5, 'Mizanur Ahmed', 'O+', NULL, 'Siam Ahmed', 'Jannat Sultana', 'Siam Ahmed', '01831491905', 'Uposhohor, Sylhet', '2021-10-31', '20218651850671657', 2, 'Active', NULL),
(21, 6, 'Mim Islam', 'A+', NULL, 'Rafiq Islam', 'Tasfia Sultana', 'Rafiq Islam', '01347379965', 'Subid Bazar, Sylhet', '2022-05-06', '20220752735454948', 2, 'Active', NULL),
(22, 7, 'Hasan Uddin', 'A+', NULL, 'Tanvir Hasan Uddin', 'Nusrat Sultana', 'Tanvir Hasan Uddin', '01463495788', 'Mirabazar, Sylhet', '2022-01-09', '20225685574443135', 2, 'Active', NULL),
(23, 8, 'Jahanara Islam', 'A-', NULL, 'Emon Rafiq Islam', 'Puja Parvin', 'Emon Rafiq Islam', '01440824008', 'Mendibag, Sylhet', '2021-06-01', '20214271094777520', 2, 'Active', NULL),
(24, 9, 'Jamal Biswas', 'AB+', NULL, 'Kamal Sabbir Biswas', 'Sanjida Begum', 'Kamal Sabbir Biswas', '01513186999', 'Zindabazar, Sylhet', '2021-03-18', '20213867749649909', 2, 'Active', NULL),
(25, 10, 'Nasrin Miah', 'A+', NULL, 'Jahid Miah', 'Shirin Khatun', 'Jahid Miah', '01897403447', 'Lamabazar, Sylhet', '2021-01-02', '20211349361832421', 2, 'Active', NULL),
(26, 11, 'Sultana Ali', 'O-', NULL, 'Siam Ali', 'Tania Sultana', 'Siam Ali', '01671906594', 'Ambarkhana, Sylhet', '2022-05-20', '20220139904902787', 2, 'Active', NULL),
(27, 12, 'Maliha Kabir', 'B+', NULL, 'Hasan Kabir', 'Shirin Sultana', 'Hasan Kabir', '01456746807', 'Bondor Bazar, Sylhet', '2022-12-10', '20221545168087603', 2, 'Active', NULL),
(28, 13, 'Salim Biswas', 'A+', NULL, 'Jamal Biswas', 'Shapla Akter', 'Jamal Biswas', '01393248086', 'Mirabazar, Sylhet', '2022-12-24', '20221317127484677', 2, 'Active', NULL),
(29, 14, 'Samira Hossain', 'O+', NULL, 'Ridwan Mahfuz Hossain', 'Halima Begum', 'Ridwan Mahfuz Hossain', '01344997278', 'Uposhohor, Sylhet', '2022-09-17', '20227558867533963', 2, 'Active', NULL),
(30, 15, 'Rokeya Chowdhury', 'O+', NULL, 'Emon Nurul Chowdhury', 'Jannat Khatun', 'Jannat Khatun', '01517187026', 'Maulavi Bazar, Sylhet', '2021-09-15', '20212174596158657', 2, 'Active', NULL);

-- Class 1 (class_id = 3)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(31, 1, 'Imran Uddin', 'O-', NULL, 'Salim Monir Uddin', 'Shirin Sultana', 'Salim Monir Uddin', '01305045562', 'Ambarkhana, Sylhet', '2021-03-27', '20213869222196937', 3, 'Active', NULL),
(32, 2, 'Sajib Khan', 'B+', NULL, 'Jahid Sajib Khan', 'Lubna Begum', 'Jahid Sajib Khan', '01375946474', 'Bondor Bazar, Sylhet', '2021-12-13', '20213671369594406', 3, 'Active', NULL),
(33, 3, 'Shamim Chowdhury', 'O+', NULL, 'Hasan Chowdhury', 'Tania Khatun', 'Hasan Chowdhury', '01521047095', 'Shibganj, Sylhet', '2020-11-21', '20202145623285884', 3, 'Active', NULL),
(34, 4, 'Nasrin Biswas', 'B+', NULL, 'Salim Biswas', 'Maliha Begum', 'Maliha Begum', '01868516048', 'Bondor Bazar, Sylhet', '2020-04-25', '20201754965137098', 3, 'Active', NULL),
(35, 5, 'Rokeya Khan', 'B+', NULL, 'Sajib Khan', 'Sultana Sultana', 'Sultana Sultana', '01313826758', 'Subid Bazar, Sylhet', '2020-06-04', '20206926179640537', 3, 'Active', NULL),
(36, 6, 'Farhana Mia', 'B+', NULL, 'Liton Ayaan Mia', 'Anika Begum', 'Liton Ayaan Mia', '01490053293', 'Lamabazar, Sylhet', '2020-08-20', '20201839335290422', 3, 'Active', NULL),
(37, 7, 'Tarek Islam', 'AB-', NULL, 'Rahim Rubel Islam', 'Ayesha Akter', 'Rahim Rubel Islam', '01326811775', 'Mendibag, Sylhet', '2021-01-09', '20218917839084700', 3, 'Active', NULL),
(38, 8, 'Masud Choudhury', 'B+', NULL, 'Imran Hasan Choudhury', 'Afia Begum', 'Imran Hasan Choudhury', '01798569847', 'Akhalia, Sylhet', '2020-02-03', '20208961183673657', 3, 'Active', NULL),
(39, 9, 'Emon Rahman', 'B+', NULL, 'Masud Jahid Rahman', 'Tasnia Khatun', 'Masud Jahid Rahman', '01361528098', 'Ambarkhana, Sylhet', '2020-02-16', '20208516560494519', 3, 'Active', NULL),
(40, 10, 'Siam Biswas', 'O+', NULL, 'Imran Shamim Biswas', 'Tasnia Begum', 'Imran Shamim Biswas', '01999809402', 'Subid Bazar, Sylhet', '2020-08-07', '20204455022961201', 3, 'Active', NULL),
(41, 11, 'Siam Choudhury', 'O+', NULL, 'Belal Nasir Choudhury', 'Tasnia Akter', 'Belal Nasir Choudhury', '01990147679', 'Maulavi Bazar, Sylhet', '2020-01-27', '20207643815614978', 3, 'Active', NULL),
(42, 12, 'Shapla Khan', 'O+', NULL, 'Ridwan Jamal Khan', 'Ayesha Khatun', 'Ridwan Jamal Khan', '01307622683', 'Akhalia, Sylhet', '2020-05-10', '20208851606071596', 3, 'Active', NULL),
(43, 13, 'Nayeem Kabir', 'B+', NULL, 'Sabbir Rahim Kabir', 'Sadia Khatun', 'Sadia Khatun', '01361369681', 'Mendibag, Sylhet', '2021-12-20', '20216453521818835', 3, 'Active', NULL),
(44, 14, 'Kamal Hossain', 'B+', NULL, 'Sohel Jahid Hossain', 'Farhana Khatun', 'Sohel Jahid Hossain', '01999799552', 'Maulavi Bazar, Sylhet', '2020-11-17', '20207177449058147', 3, 'Active', NULL),
(45, 15, 'Nurul Mia', 'B+', NULL, 'Kamal Mia', 'Shirin Parvin', 'Kamal Mia', '01907935978', 'Ambarkhana, Sylhet', '2021-10-25', '20212071518203778', 3, 'Active', NULL);

-- Class 2 (class_id = 4)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(46, 1, 'Jamal Mia', 'A+', NULL, 'Salim Nurul Mia', 'Samira Akter', 'Salim Nurul Mia', '01764492519', 'Pathantula, Sylhet', '2020-02-03', '20202546291486528', 4, 'Active', NULL),
(47, 2, 'Shapla Kabir', 'B+', NULL, 'Rahim Kabir', 'Tasnia Akter', 'Rahim Kabir', '01421418880', 'Akhalia, Sylhet', '2020-09-05', '20205929622292706', 4, 'Active', NULL),
(48, 3, 'Nusrat Khan', 'B+', NULL, 'Nayeem Khan', 'Tania Sultana', 'Tania Sultana', '01459774688', 'Lamabazar, Sylhet', '2020-08-28', '20206239240758181', 4, 'Active', NULL),
(49, 4, 'Monir Islam', 'O+', NULL, 'Mahfuz Sohel Islam', 'Ishrat Begum', 'Ishrat Begum', '01606853615', 'Shahjalal Uposhohor, Sylhet', '2020-06-27', '20203051522047277', 4, 'Active', NULL),
(50, 5, 'Tania Uddin', 'A+', NULL, 'Habibur Sohel Uddin', 'Puja Sultana', 'Habibur Sohel Uddin', '01469711798', 'Pathantula, Sylhet', '2019-06-04', '20190893246095396', 4, 'Active', NULL),
(51, 6, 'Mahfuz Uddin', 'A+', NULL, 'Liton Uddin', 'Nasrin Parvin', 'Nasrin Parvin', '01365405153', 'Lamabazar, Sylhet', '2019-07-19', '20191952058527722', 4, 'Active', NULL),
(52, 7, 'Sultana Sarker', 'A+', NULL, 'Mizanur Karim Sarker', 'Farhana Begum', 'Mizanur Karim Sarker', '01334505415', 'Bondor Bazar, Sylhet', '2020-10-05', '20206676527758416', 4, 'Active', NULL),
(53, 8, 'Tania Islam', 'A+', NULL, 'Masud Islam', 'Jahanara Begum', 'Masud Islam', '01627570596', 'Lamabazar, Sylhet', '2020-08-16', '20204016582029702', 4, 'Active', NULL),
(54, 9, 'Liton Mia', 'A+', NULL, 'Siam Karim Mia', 'Momena Sultana', 'Siam Karim Mia', '01756543102', 'Mendibag, Sylhet', '2020-02-09', '20207868144739473', 4, 'Active', NULL),
(55, 10, 'Rayhan Uddin', 'B+', NULL, 'Rakib Faruk Uddin', 'Sadia Akter', 'Sadia Akter', '01825831323', 'Akhalia, Sylhet', '2020-06-02', '20207058957829114', 4, 'Active', NULL),
(56, 11, 'Kamal Biswas', 'A+', NULL, 'Tanvir Biswas', 'Nasrin Khatun', 'Tanvir Biswas', '01528922680', 'Mirabazar, Sylhet', '2020-08-26', '20201824225358414', 4, 'Active', NULL),
(57, 12, 'Nasir Alam', 'B+', NULL, 'Arif Nayeem Alam', 'Tasfia Begum', 'Arif Nayeem Alam', '01895900109', 'Zindabazar, Sylhet', '2019-03-29', '20194396907844736', 4, 'Active', NULL),
(58, 13, 'Momena Chowdhury', 'A+', NULL, 'Tanvir Emon Chowdhury', 'Nabila Khatun', 'Tanvir Emon Chowdhury', '01956258815', 'Mendibag, Sylhet', '2020-06-12', '20203714732104696', 4, 'Active', NULL),
(59, 14, 'Hasan Islam', 'O+', NULL, 'Siam Islam', 'Sadia Khatun', 'Sadia Khatun', '01601687339', 'Akhalia, Sylhet', '2020-09-12', '20205004797480162', 4, 'Active', NULL),
(60, 15, 'Farhana Mia', 'A+', NULL, 'Liton Mia', 'Rokeya Sultana', 'Liton Mia', '01687849912', 'Ambarkhana, Sylhet', '2020-10-10', '20201655852398680', 4, 'Active', NULL);

-- Class 3 (class_id = 5)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(61, 1, 'Mahfuz Talukder', 'O+', NULL, 'Zahid Talukder', 'Nabila Khatun', 'Nabila Khatun', '01526949588', 'Shibganj, Sylhet', '2018-06-17', '20188794705516940', 5, 'Active', NULL),
(62, 2, 'Nayeem Khan', 'AB-', NULL, 'Tawhid Khan', 'Mahiya Khatun', 'Tawhid Khan', '01409130756', 'Kumarpara, Sylhet', '2019-03-17', '20192636897028385', 5, 'Active', NULL),
(63, 3, 'Jahid Choudhury', 'A+', NULL, 'Anwar Sajib Choudhury', 'Tasfia Akter', 'Tasfia Akter', '01584344375', 'Akhalia, Sylhet', '2019-04-09', '20197584419866524', 5, 'Active', NULL),
(64, 4, 'Tasfia Uddin', 'B+', NULL, 'Rakib Jahid Uddin', 'Mahiya Khatun', 'Rakib Jahid Uddin', '01419933083', 'Subid Bazar, Sylhet', '2019-10-15', '20193016571208267', 5, 'Active', NULL),
(65, 5, 'Karim Ali', 'A+', NULL, 'Jamal Faruk Ali', 'Rumana Parvin', 'Rumana Parvin', '01406724004', 'Zindabazar, Sylhet', '2018-08-02', '20189915478872874', 5, 'Active', NULL),
(66, 6, 'Salim Talukder', 'O+', NULL, 'Sajib Jahid Talukder', 'Tahmina Begum', 'Sajib Jahid Talukder', '01866851612', 'Maulavi Bazar, Sylhet', '2018-03-31', '20182753046374549', 5, 'Active', NULL),
(67, 7, 'Sumaiya Alam', 'B+', NULL, 'Tarek Alam', 'Salma Begum', 'Tarek Alam', '01841459332', 'Mirabazar, Sylhet', '2019-12-18', '20197279568783391', 5, 'Active', NULL),
(68, 8, 'Mizanur Mia', 'A-', NULL, 'Siam Shahin Mia', 'Salma Parvin', 'Siam Shahin Mia', '01771397187', 'Maulavi Bazar, Sylhet', '2018-03-26', '20180728679087406', 5, 'Active', NULL),
(69, 9, 'Ayaan Miah', 'O+', NULL, 'Karim Miah', 'Ishrat Akter', 'Ishrat Akter', '01604622656', 'Subid Bazar, Sylhet', '2018-02-05', '20187661825128682', 5, 'Active', NULL),
(70, 10, 'Jannat Ahmed', 'B+', NULL, 'Arif Ahmed', 'Nabila Parvin', 'Arif Ahmed', '01443106903', 'Lamabazar, Sylhet', '2018-05-07', '20183119079030673', 5, 'Active', NULL),
(71, 11, 'Masud Chowdhury', 'B+', NULL, 'Salim Monir Chowdhury', 'Sadia Parvin', 'Sadia Parvin', '01883644089', 'Lamabazar, Sylhet', '2018-06-04', '20182687056856624', 5, 'Active', NULL),
(72, 12, 'Rayhan Biswas', 'A+', NULL, 'Monir Arif Biswas', 'Momena Sultana', 'Monir Arif Biswas', '01463435175', 'Subid Bazar, Sylhet', '2019-08-02', '20191830469901398', 5, 'Active', NULL),
(73, 13, 'Emon Talukder', 'B+', NULL, 'Abdul Habibur Talukder', 'Farhana Begum', 'Abdul Habibur Talukder', '01463854678', 'Bondor Bazar, Sylhet', '2018-12-23', '20185445877175355', 5, 'Active', NULL),
(74, 14, 'Tawhid Khan', 'A+', NULL, 'Rahim Khan', 'Lubna Parvin', 'Rahim Khan', '01536937854', 'Mendibag, Sylhet', '2019-06-01', '20197772522872808', 5, 'Active', NULL),
(75, 15, 'Rumana Uddin', 'O+', NULL, 'Jamal Uddin', 'Ayesha Sultana', 'Jamal Uddin', '01487509977', 'Pathantula, Sylhet', '2018-12-29', '20180088600848408', 5, 'Active', NULL);

-- Class 4 (class_id = 6)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(76, 1, 'Tarek Kabir', 'O+', NULL, 'Anwar Kabir', 'Jahanara Begum', 'Anwar Kabir', '01954615679', 'Zindabazar, Sylhet', '2017-11-14', '20173341016668700', 6, 'Active', NULL),
(77, 2, 'Monir Biswas', 'O+', NULL, 'Belal Biswas', 'Jahanara Parvin', 'Jahanara Parvin', '01640148902', 'Mirabazar, Sylhet', '2017-12-21', '20175039261429396', 6, 'Active', NULL),
(78, 3, 'Ishrat Talukder', 'A+', NULL, 'Rubel Faruk Talukder', 'Rima Akter', 'Rubel Faruk Talukder', '01999650477', 'Ambarkhana, Sylhet', '2017-02-08', '20173586629619431', 6, 'Active', NULL),
(79, 4, 'Shirin Choudhury', 'A+', NULL, 'Sohel Choudhury', 'Jannat Akter', 'Sohel Choudhury', '01941212678', 'Uposhohor, Sylhet', '2017-06-07', '20178861015819956', 6, 'Active', NULL),
(80, 5, 'Nurul Choudhury', 'A+', NULL, 'Rayhan Choudhury', 'Nusrat Parvin', 'Rayhan Choudhury', '01572126464', 'Uposhohor, Sylhet', '2017-03-13', '20177154379937124', 6, 'Active', NULL),
(81, 6, 'Halima Talukder', 'O+', NULL, 'Nurul Talukder', 'Maliha Sultana', 'Nurul Talukder', '01837526547', 'Mirabazar, Sylhet', '2018-06-14', '20189356465193982', 6, 'Active', NULL),
(82, 7, 'Kamal Ahmed', 'A+', NULL, 'Sajib Ahmed', 'Shapla Sultana', 'Sajib Ahmed', '01843426617', 'Subid Bazar, Sylhet', '2018-12-11', '20189796886805891', 6, 'Active', NULL),
(83, 8, 'Fahim Mia', 'O+', NULL, 'Nayeem Karim Mia', 'Rifat Akter', 'Nayeem Karim Mia', '01488899375', 'Akhalia, Sylhet', '2017-01-06', '20176798250714611', 6, 'Active', NULL),
(84, 9, 'Mahiya Hossain', 'A+', NULL, 'Belal Sajib Hossain', 'Shapla Parvin', 'Belal Sajib Hossain', '01651401051', 'Pathantula, Sylhet', '2017-08-13', '20172382825867362', 6, 'Active', NULL),
(85, 10, 'Ayesha Kabir', 'B+', NULL, 'Nayeem Mizanur Kabir', 'Afia Parvin', 'Nayeem Mizanur Kabir', '01819182553', 'Kumarpara, Sylhet', '2017-04-16', '20177147859696915', 6, 'Active', NULL),
(86, 11, 'Nusrat Islam', 'O+', NULL, 'Arif Islam', 'Shirin Khatun', 'Arif Islam', '01828669296', 'Mendibag, Sylhet', '2018-03-01', '20186278282742257', 6, 'Active', NULL),
(87, 12, 'Rayhan Mia', 'A+', NULL, 'Hasan Mia', 'Halima Khatun', 'Hasan Mia', '01677219034', 'Lamabazar, Sylhet', '2018-07-29', '20180438427978819', 6, 'Active', NULL),
(88, 13, 'Ishrat Mia', 'B+', NULL, 'Karim Mia', 'Afia Parvin', 'Karim Mia', '01507451713', 'Bondor Bazar, Sylhet', '2017-12-01', '20173959629233095', 6, 'Active', NULL),
(89, 14, 'Imran Islam', 'AB+', NULL, 'Salim Salim Islam', 'Mim Parvin', 'Mim Parvin', '01522325367', 'Tilagor, Sylhet', '2017-07-30', '20172946671168457', 6, 'Active', NULL),
(90, 15, 'Ayaan Ahmed', 'A+', NULL, 'Faruk Ahmed', 'Nabila Akter', 'Nabila Akter', '01937454589', 'Uposhohor, Sylhet', '2018-04-22', '20182975001701277', 6, 'Active', NULL);

-- Class 5 (class_id = 7)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(91, 1, 'Rafiq Miah', 'O+', NULL, 'Rubel Miah', 'Sultana Khatun', 'Rubel Miah', '01352064361', 'Mendibag, Sylhet', '2016-12-01', '20161037129387005', 7, 'Active', NULL),
(92, 2, 'Jahanara Kabir', 'O+', NULL, 'Emon Kabir', 'Nasrin Khatun', 'Emon Kabir', '01526221890', 'Bondor Bazar, Sylhet', '2016-06-09', '20169275326973112', 7, 'Active', NULL),
(93, 3, 'Shirin Choudhury', 'O+', NULL, 'Fahim Masud Choudhury', 'Halima Khatun', 'Fahim Masud Choudhury', '01894043898', 'Maulavi Bazar, Sylhet', '2016-10-10', '20163640376137918', 7, 'Active', NULL),
(94, 4, 'Tasfia Mia', 'B+', NULL, 'Rubel Mia', 'Jannat Parvin', 'Jannat Parvin', '01910910430', 'Shibganj, Sylhet', '2016-08-29', '20160684866618892', 7, 'Active', NULL),
(95, 5, 'Nasrin Uddin', 'O+', NULL, 'Habibur Uddin', 'Momena Parvin', 'Habibur Uddin', '01930316179', 'Akhalia, Sylhet', '2017-12-24', '20179042102027588', 7, 'Active', NULL),
(96, 6, 'Ishrat Alam', 'A+', NULL, 'Rubel Rafiq Alam', 'Rahima Begum', 'Rubel Rafiq Alam', '01891778507', 'Kumarpara, Sylhet', '2017-09-26', '20179252419138000', 7, 'Active', NULL),
(97, 7, 'Tanvir Mia', 'A+', NULL, 'Sohel Anwar Mia', 'Rokeya Parvin', 'Sohel Anwar Mia', '01854195180', 'Subid Bazar, Sylhet', '2016-06-13', '20162380617445187', 7, 'Active', NULL),
(98, 8, 'Sanjida Ali', 'A+', NULL, 'Arif Ali', 'Nusrat Sultana', 'Arif Ali', '01420603850', 'Shahjalal Uposhohor, Sylhet', '2016-10-06', '20165064138367024', 7, 'Active', NULL),
(99, 9, 'Shirin Khan', 'A+', NULL, 'Zahid Khan', 'Samira Akter', 'Zahid Khan', '01961990623', 'Zindabazar, Sylhet', '2016-09-15', '20164456557431329', 7, 'Active', NULL),
(100, 10, 'Shapla Islam', 'B-', NULL, 'Masud Tanvir Islam', 'Rahima Parvin', 'Masud Tanvir Islam', '01911249035', 'Mirabazar, Sylhet', '2017-06-07', '20172135680442067', 7, 'Active', NULL),
(101, 11, 'Rumana Khan', 'A+', NULL, 'Imran Rubel Khan', 'Rahima Begum', 'Imran Rubel Khan', '01519941013', 'Pathantula, Sylhet', '2016-04-11', '20167215107029667', 7, 'Active', NULL),
(102, 12, 'Momena Kabir', 'B+', NULL, 'Habibur Anwar Kabir', 'Mim Akter', 'Habibur Anwar Kabir', '01447687014', 'Bondor Bazar, Sylhet', '2016-11-10', '20166263838065787', 7, 'Active', NULL),
(103, 13, 'Mim Talukder', 'O+', NULL, 'Anwar Rahim Talukder', 'Sadia Parvin', 'Anwar Rahim Talukder', '01993213348', 'Tilagor, Sylhet', '2016-08-29', '20160396522395590', 7, 'Active', NULL),
(104, 14, 'Sanjida Hossain', 'B+', NULL, 'Mizanur Hossain', 'Sanjida Parvin', 'Mizanur Hossain', '01730870593', 'Pathantula, Sylhet', '2016-02-16', '20162525002921851', 7, 'Active', NULL),
(105, 15, 'Sumaiya Choudhury', 'AB+', NULL, 'Belal Choudhury', 'Sultana Akter', 'Sultana Akter', '01852895392', 'Bondor Bazar, Sylhet', '2017-11-24', '20176442209690295', 7, 'Active', NULL);

-- Class 6 (class_id = 8)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(106, 1, 'Nasrin Khan', 'B+', NULL, 'Imran Khan', 'Sanjida Khatun', 'Sanjida Khatun', '01415704331', 'Zindabazar, Sylhet', '2015-06-27', '20155410067626765', 8, 'Active', NULL),
(107, 2, 'Rokeya Biswas', 'A+', NULL, 'Siam Biswas', 'Rumana Khatun', 'Siam Biswas', '01315262181', 'Subid Bazar, Sylhet', '2016-01-11', '20165997062962015', 8, 'Active', NULL),
(108, 3, 'Jahanara Kabir', 'B+', NULL, 'Ayaan Kabir', 'Lubna Akter', 'Ayaan Kabir', '01972050614', 'Shahjalal Uposhohor, Sylhet', '2015-07-21', '20159731032417146', 8, 'Active', NULL),
(109, 4, 'Liton Alam', 'O+', NULL, 'Ayaan Nurul Alam', 'Tahmina Akter', 'Ayaan Nurul Alam', '01674349021', 'Subid Bazar, Sylhet', '2015-08-17', '20151586938068687', 8, 'Active', NULL),
(110, 5, 'Siam Biswas', 'O+', NULL, 'Sabbir Karim Biswas', 'Rima Parvin', 'Rima Parvin', '01622332061', 'Mirabazar, Sylhet', '2015-03-03', '20156329451168685', 8, 'Active', NULL),
(111, 6, 'Momena Sarker', 'O+', NULL, 'Abdul Sarker', 'Puja Sultana', 'Abdul Sarker', '01911914856', 'Uposhohor, Sylhet', '2015-10-18', '20154679970246299', 8, 'Active', NULL),
(112, 7, 'Liton Chowdhury', 'B+', NULL, 'Belal Tarek Chowdhury', 'Salma Sultana', 'Belal Tarek Chowdhury', '01544713247', 'Ambarkhana, Sylhet', '2015-06-22', '20155469137367850', 8, 'Active', NULL),
(113, 8, 'Rahim Uddin', 'O+', NULL, 'Mahfuz Sabbir Uddin', 'Halima Parvin', 'Halima Parvin', '01403070534', 'Tilagor, Sylhet', '2015-04-09', '20155786103579727', 8, 'Active', NULL),
(114, 9, 'Sumaiya Mia', 'A+', NULL, 'Jahid Faruk Mia', 'Tania Begum', 'Jahid Faruk Mia', '01834680072', 'Shibganj, Sylhet', '2015-04-24', '20152903494466574', 8, 'Active', NULL),
(115, 10, 'Ridwan Choudhury', 'B+', NULL, 'Abdul Choudhury', 'Rima Akter', 'Abdul Choudhury', '01615454443', 'Akhalia, Sylhet', '2016-06-01', '20162830965207446', 8, 'Active', NULL),
(116, 11, 'Monir Chowdhury', 'B+', NULL, 'Siam Chowdhury', 'Farhana Akter', 'Siam Chowdhury', '01528241724', 'Mendibag, Sylhet', '2016-12-09', '20168251353465549', 8, 'Active', NULL),
(117, 12, 'Mahfuz Rahman', 'A+', NULL, 'Tawhid Tawhid Rahman', 'Nasrin Sultana', 'Tawhid Tawhid Rahman', '01560223569', 'Lamabazar, Sylhet', '2015-12-15', '20157252175250074', 8, 'Active', NULL),
(118, 13, 'Ishrat Islam', 'B+', NULL, 'Nasir Islam', 'Sanjida Begum', 'Nasir Islam', '01660083505', 'Zindabazar, Sylhet', '2016-07-25', '20168300335421689', 8, 'Active', NULL),
(119, 14, 'Fahim Chowdhury', 'O+', NULL, 'Salim Sajib Chowdhury', 'Puja Parvin', 'Puja Parvin', '01653260332', 'Maulavi Bazar, Sylhet', '2015-06-25', '20153098215064890', 8, 'Active', NULL),
(120, 15, 'Jannat Rahman', 'O+', NULL, 'Rahim Rahman', 'Salma Begum', 'Rahim Rahman', '01823046184', 'Lamabazar, Sylhet', '2015-10-08', '20159926189141173', 8, 'Active', NULL);

-- Class 7 (class_id = 9)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(121, 1, 'Rokeya Alam', 'O+', NULL, 'Mizanur Alam', 'Anika Sultana', 'Mizanur Alam', '01653001197', 'Mendibag, Sylhet', '2015-04-17', '20152181143744701', 9, 'Active', NULL),
(122, 2, 'Imran Chowdhury', 'O+', NULL, 'Liton Chowdhury', 'Sadia Sultana', 'Sadia Sultana', '01825579415', 'Maulavi Bazar, Sylhet', '2014-01-05', '20145216674676212', 9, 'Active', NULL),
(123, 3, 'Shamim Islam', 'O+', NULL, 'Tawhid Emon Islam', 'Afia Khatun', 'Afia Khatun', '01827716701', 'Subid Bazar, Sylhet', '2014-12-17', '20144508993588916', 9, 'Active', NULL),
(124, 4, 'Nasir Biswas', 'A+', NULL, 'Nurul Sohel Biswas', 'Salma Begum', 'Salma Begum', '01375354083', 'Kumarpara, Sylhet', '2015-09-11', '20158663177971775', 9, 'Active', NULL),
(125, 5, 'Nayeem Ahmed', 'B+', NULL, 'Tanvir Karim Ahmed', 'Ayesha Begum', 'Tanvir Karim Ahmed', '01875503758', 'Akhalia, Sylhet', '2015-09-18', '20159975711305548', 9, 'Active', NULL),
(126, 6, 'Farhana Rahman', 'B+', NULL, 'Nasir Hasan Rahman', 'Halima Sultana', 'Halima Sultana', '01637351609', 'Mirabazar, Sylhet', '2014-03-03', '20141779827080869', 9, 'Active', NULL),
(127, 7, 'Sadia Islam', 'AB+', NULL, 'Anwar Islam', 'Halima Begum', 'Halima Begum', '01834654722', 'Ambarkhana, Sylhet', '2015-08-03', '20156984858333945', 9, 'Active', NULL),
(128, 8, 'Tawhid Islam', 'A+', NULL, 'Masud Islam', 'Rahima Akter', 'Masud Islam', '01984608106', 'Mendibag, Sylhet', '2015-12-12', '20152003424420438', 9, 'Active', NULL),
(129, 9, 'Salim Sarker', 'O+', NULL, 'Rayhan Monir Sarker', 'Jannat Khatun', 'Rayhan Monir Sarker', '01958004397', 'Zindabazar, Sylhet', '2014-07-15', '20143598933472122', 9, 'Active', NULL),
(130, 10, 'Lubna Choudhury', 'B+', NULL, 'Rafiq Rayhan Choudhury', 'Lubna Khatun', 'Rafiq Rayhan Choudhury', '01402590947', 'Uposhohor, Sylhet', '2014-06-19', '20149851583281826', 9, 'Active', NULL),
(131, 11, 'Puja Uddin', 'B+', NULL, 'Habibur Belal Uddin', 'Maliha Akter', 'Habibur Belal Uddin', '01801573993', 'Maulavi Bazar, Sylhet', '2015-10-15', '20150561648408588', 9, 'Active', NULL),
(132, 12, 'Jahanara Ali', 'O+', NULL, 'Mizanur Ali', 'Sadia Parvin', 'Mizanur Ali', '01813361386', 'Subid Bazar, Sylhet', '2014-10-03', '20141207501102481', 9, 'Active', NULL),
(133, 13, 'Rahima Alam', 'O+', NULL, 'Rakib Sabbir Alam', 'Ishrat Akter', 'Rakib Sabbir Alam', '01390158144', 'Mendibag, Sylhet', '2014-11-25', '20149147660728326', 9, 'Active', NULL),
(134, 14, 'Abdul Ali', 'O+', NULL, 'Sohel Ali', 'Sultana Akter', 'Sohel Ali', '01796881435', 'Mendibag, Sylhet', '2014-03-05', '20143682223943129', 9, 'Active', NULL),
(135, 15, 'Farhana Sarker', 'B+', NULL, 'Kamal Sarker', 'Tania Begum', 'Kamal Sarker', '01831491357', 'Lamabazar, Sylhet', '2015-06-19', '20157594929955620', 9, 'Active', NULL);

-- Class 8 (class_id = 10)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(136, 1, 'Maliha Khan', 'A+', NULL, 'Fahim Khan', 'Mim Akter', 'Fahim Khan', '01947812914', 'Maulavi Bazar, Sylhet', '2014-08-25', '20142834110809969', 10, 'Active', NULL),
(137, 2, 'Rumana Alam', 'A+', NULL, 'Ayaan Alam', 'Mahiya Khatun', 'Ayaan Alam', '01716580392', 'Shibganj, Sylhet', '2014-03-10', '20148272299275037', 10, 'Active', NULL),
(138, 3, 'Nabila Mia', 'B+', NULL, 'Habibur Zahid Mia', 'Tasnia Sultana', 'Tasnia Sultana', '01518449892', 'Kumarpara, Sylhet', '2013-01-21', '20136659184638655', 10, 'Active', NULL),
(139, 4, 'Rima Ahmed', 'A+', NULL, 'Rubel Ahmed', 'Afia Khatun', 'Rubel Ahmed', '01459136517', 'Mirabazar, Sylhet', '2014-04-19', '20147739260302992', 10, 'Active', NULL),
(140, 5, 'Tahmina Chowdhury', 'O+', NULL, 'Sohel Chowdhury', 'Salma Khatun', 'Salma Khatun', '01804137977', 'Zindabazar, Sylhet', '2014-11-03', '20142369292984257', 10, 'Active', NULL),
(141, 6, 'Mahfuz Khan', 'AB+', NULL, 'Rubel Imran Khan', 'Fatema Khatun', 'Rubel Imran Khan', '01479908811', 'Kumarpara, Sylhet', '2014-03-18', '20147298068650863', 10, 'Active', NULL),
(142, 7, 'Rumana Choudhury', 'O+', NULL, 'Siam Imran Choudhury', 'Ishrat Khatun', 'Siam Imran Choudhury', '01764300981', 'Uposhohor, Sylhet', '2013-05-26', '20138063565126944', 10, 'Active', NULL),
(143, 8, 'Rayhan Mia', 'AB+', NULL, 'Sabbir Mia', 'Shapla Sultana', 'Sabbir Mia', '01774495621', 'Maulavi Bazar, Sylhet', '2014-04-02', '20143721386589026', 10, 'Active', NULL),
(144, 9, 'Rumana Uddin', 'A+', NULL, 'Emon Uddin', 'Ishrat Begum', 'Emon Uddin', '01866984902', 'Maulavi Bazar, Sylhet', '2014-02-10', '20147703843098839', 10, 'Active', NULL),
(145, 10, 'Shamim Mia', 'A+', NULL, 'Abdul Nasir Mia', 'Shirin Akter', 'Abdul Nasir Mia', '01701184895', 'Zindabazar, Sylhet', '2014-07-27', '20145439376904268', 10, 'Active', NULL),
(146, 11, 'Siam Ali', 'O+', NULL, 'Shahin Mahfuz Ali', 'Lubna Parvin', 'Shahin Mahfuz Ali', '01697357790', 'Shibganj, Sylhet', '2014-12-22', '20147141633565880', 10, 'Active', NULL),
(147, 12, 'Emon Khan', 'O+', NULL, 'Sabbir Belal Khan', 'Nasrin Parvin', 'Sabbir Belal Khan', '01742373334', 'Mirabazar, Sylhet', '2014-07-01', '20143333952111790', 10, 'Active', NULL),
(148, 13, 'Siam Chowdhury', 'O+', NULL, 'Liton Chowdhury', 'Sadia Sultana', 'Liton Chowdhury', '01984639208', 'Maulavi Bazar, Sylhet', '2014-09-09', '20146780856271875', 10, 'Active', NULL),
(149, 14, 'Anwar Miah', 'B+', NULL, 'Imran Masud Miah', 'Tasnia Parvin', 'Imran Masud Miah', '01755276365', 'Uposhohor, Sylhet', '2014-05-02', '20145647292931438', 10, 'Active', NULL),
(150, 15, 'Halima Miah', 'A+', NULL, 'Sohel Emon Miah', 'Ayesha Khatun', 'Sohel Emon Miah', '01790612034', 'Mendibag, Sylhet', '2014-09-07', '20147175455884506', 10, 'Active', NULL);

-- Class 9 (Science) (class_id = 11)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(151, 1, 'Rima Miah', 'B+', NULL, 'Ayaan Miah', 'Tahmina Akter', 'Tahmina Akter', '01694722569', 'Kumarpara, Sylhet', '2013-08-17', '20139611253554496', 11, 'Active', NULL),
(152, 2, 'Fatema Mia', 'A+', NULL, 'Zahid Mia', 'Afia Sultana', 'Zahid Mia', '01813261117', 'Akhalia, Sylhet', '2012-04-30', '20128006811492164', 11, 'Active', NULL),
(153, 3, 'Anika Ali', 'B+', NULL, 'Rubel Rubel Ali', 'Puja Khatun', 'Rubel Rubel Ali', '01984872829', 'Uposhohor, Sylhet', '2013-09-01', '20139796884578317', 11, 'Active', NULL),
(154, 4, 'Mahiya Alam', 'A+', NULL, 'Abdul Abdul Alam', 'Puja Khatun', 'Puja Khatun', '01974064930', 'Pathantula, Sylhet', '2012-12-18', '20128536866326634', 11, 'Active', NULL),
(155, 5, 'Ayaan Khan', 'A+', NULL, 'Nayeem Khan', 'Mim Akter', 'Nayeem Khan', '01322417974', 'Kumarpara, Sylhet', '2013-07-31', '20139735020802144', 11, 'Active', NULL),
(156, 6, 'Sultana Ahmed', 'A+', NULL, 'Sohel Abdul Ahmed', 'Sanjida Khatun', 'Sohel Abdul Ahmed', '01905120461', 'Akhalia, Sylhet', '2013-07-10', '20138723460136730', 11, 'Active', NULL),
(157, 7, 'Arif Rahman', 'A+', NULL, 'Habibur Rahman', 'Mahiya Sultana', 'Habibur Rahman', '01388147435', 'Maulavi Bazar, Sylhet', '2013-03-23', '20130313650249163', 11, 'Active', NULL),
(158, 8, 'Sanjida Biswas', 'O+', NULL, 'Sohel Biswas', 'Tasnia Begum', 'Sohel Biswas', '01900528127', 'Mirabazar, Sylhet', '2012-12-17', '20123585730652407', 11, 'Active', NULL),
(159, 9, 'Anika Ali', 'B+', NULL, 'Hasan Ali', 'Farhana Parvin', 'Hasan Ali', '01998218274', 'Zindabazar, Sylhet', '2013-08-28', '20134857086209593', 11, 'Active', NULL),
(160, 10, 'Samira Choudhury', 'O+', NULL, 'Hasan Rayhan Choudhury', 'Momena Parvin', 'Hasan Rayhan Choudhury', '01810220317', 'Zindabazar, Sylhet', '2013-02-26', '20133109678994053', 11, 'Active', NULL),
(161, 11, 'Salma Ahmed', 'O+', NULL, 'Habibur Ahmed', 'Sanjida Begum', 'Habibur Ahmed', '01650948014', 'Ambarkhana, Sylhet', '2013-10-13', '20131381138633839', 11, 'Active', NULL),
(162, 12, 'Fahim Kabir', 'O+', NULL, 'Siam Kabir', 'Anika Sultana', 'Siam Kabir', '01768528975', 'Shahjalal Uposhohor, Sylhet', '2012-03-26', '20125855665939836', 11, 'Active', NULL),
(163, 13, 'Salim Alam', 'O+', NULL, 'Rakib Rakib Alam', 'Rifat Begum', 'Rakib Rakib Alam', '01504335048', 'Subid Bazar, Sylhet', '2012-09-22', '20128899210752245', 11, 'Active', NULL),
(164, 14, 'Kamal Khan', 'A+', NULL, 'Arif Faruk Khan', 'Rifat Parvin', 'Arif Faruk Khan', '01991940961', 'Mirabazar, Sylhet', '2013-09-05', '20130556613906048', 11, 'Active', NULL),
(165, 15, 'Ridwan Hossain', 'B+', NULL, 'Monir Sohel Hossain', 'Salma Sultana', 'Monir Sohel Hossain', '01962251790', 'Bondor Bazar, Sylhet', '2012-04-23', '20128641686227837', 11, 'Active', NULL);

-- Class 9 (Humanities) (class_id = 12)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(166, 1, 'Ishrat Miah', 'O+', NULL, 'Zahid Miah', 'Nusrat Khatun', 'Nusrat Khatun', '01316655355', 'Ambarkhana, Sylhet', '2013-12-17', '20139042597927033', 12, 'Active', NULL),
(167, 2, 'Rahima Uddin', 'O+', NULL, 'Jamal Tarek Uddin', 'Momena Akter', 'Jamal Tarek Uddin', '01538338848', 'Bondor Bazar, Sylhet', '2013-08-19', '20137920698042043', 12, 'Active', NULL),
(168, 3, 'Liton Alam', 'B+', NULL, 'Abdul Kamal Alam', 'Jannat Akter', 'Abdul Kamal Alam', '01863681579', 'Akhalia, Sylhet', '2012-01-10', '20128123878003845', 12, 'Active', NULL),
(169, 4, 'Mahfuz Islam', 'B+', NULL, 'Shamim Shamim Islam', 'Sultana Khatun', 'Shamim Shamim Islam', '01608432562', 'Ambarkhana, Sylhet', '2013-02-01', '20131689363926495', 12, 'Active', NULL),
(170, 5, 'Arif Miah', 'A+', NULL, 'Tawhid Miah', 'Tasfia Khatun', 'Tasfia Khatun', '01929251881', 'Maulavi Bazar, Sylhet', '2012-08-08', '20122520566474231', 12, 'Active', NULL),
(171, 6, 'Fatema Alam', 'A+', NULL, 'Nayeem Alam', 'Rumana Parvin', 'Nayeem Alam', '01628975267', 'Shahjalal Uposhohor, Sylhet', '2013-02-10', '20137223306046333', 12, 'Active', NULL),
(172, 7, 'Fahim Sarker', 'B+', NULL, 'Hasan Sarker', 'Sadia Sultana', 'Hasan Sarker', '01965699988', 'Pathantula, Sylhet', '2013-01-22', '20130817703886086', 12, 'Active', NULL),
(173, 8, 'Ishrat Chowdhury', 'A+', NULL, 'Rakib Sabbir Chowdhury', 'Sultana Akter', 'Sultana Akter', '01882771812', 'Tilagor, Sylhet', '2013-11-10', '20139826657027937', 12, 'Active', NULL),
(174, 9, 'Liton Islam', 'A+', NULL, 'Shahin Islam', 'Shirin Begum', 'Shahin Islam', '01889268602', 'Ambarkhana, Sylhet', '2012-09-25', '20125922220644742', 12, 'Active', NULL),
(175, 10, 'Ayaan Miah', 'A+', NULL, 'Jahid Abdul Miah', 'Nabila Sultana', 'Nabila Sultana', '01439776719', 'Mendibag, Sylhet', '2012-11-07', '20129038498302205', 12, 'Active', NULL),
(176, 11, 'Jamal Chowdhury', 'A+', NULL, 'Ridwan Chowdhury', 'Sultana Akter', 'Sultana Akter', '01449998279', 'Akhalia, Sylhet', '2012-08-01', '20125014556168147', 12, 'Active', NULL),
(177, 12, 'Imran Alam', 'A+', NULL, 'Tanvir Zahid Alam', 'Shapla Khatun', 'Tanvir Zahid Alam', '01746954899', 'Maulavi Bazar, Sylhet', '2012-09-04', '20125299787729343', 12, 'Active', NULL),
(178, 13, 'Tanvir Sarker', 'B+', NULL, 'Shahin Sarker', 'Shapla Parvin', 'Shahin Sarker', '01930344144', 'Tilagor, Sylhet', '2012-06-19', '20128850155699023', 12, 'Active', NULL),
(179, 14, 'Nabila Biswas', 'O+', NULL, 'Karim Biswas', 'Halima Sultana', 'Karim Biswas', '01608495880', 'Ambarkhana, Sylhet', '2013-08-25', '20133955124056829', 12, 'Active', NULL),
(180, 15, 'Shirin Rahman', 'O+', NULL, 'Arif Rahman', 'Sadia Begum', 'Arif Rahman', '01943842150', 'Ambarkhana, Sylhet', '2013-05-02', '20133178078235784', 12, 'Active', NULL);

-- Class 10 (Science) (class_id = 13)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(181, 1, 'Sajib Rahman', 'O+', NULL, 'Zahid Rahman', 'Halima Khatun', 'Zahid Rahman', '01509157018', 'Shibganj, Sylhet', '2012-09-24', '20124094353344857', 13, 'Active', NULL),
(182, 2, 'Anika Hossain', 'A+', NULL, 'Shahin Abdul Hossain', 'Rima Begum', 'Shahin Abdul Hossain', '01849321495', 'Bondor Bazar, Sylhet', '2012-05-18', '20128702070160166', 13, 'Active', NULL),
(183, 3, 'Ayaan Sarker', 'A+', NULL, 'Arif Sarker', 'Maliha Khatun', 'Arif Sarker', '01371747733', 'Kumarpara, Sylhet', '2011-08-27', '20112945625577017', 13, 'Active', NULL),
(184, 4, 'Mahfuz Sarker', 'B+', NULL, 'Salim Sarker', 'Anika Parvin', 'Salim Sarker', '01915814876', 'Uposhohor, Sylhet', '2011-07-27', '20119639382761539', 13, 'Active', NULL),
(185, 5, 'Siam Talukder', 'O+', NULL, 'Tarek Talukder', 'Tahmina Begum', 'Tarek Talukder', '01658172461', 'Kumarpara, Sylhet', '2012-02-28', '20129196570132902', 13, 'Active', NULL),
(186, 6, 'Masud Ali', 'A+', NULL, 'Siam Rakib Ali', 'Farhana Khatun', 'Siam Rakib Ali', '01846519098', 'Akhalia, Sylhet', '2012-10-18', '20126240580085140', 13, 'Active', NULL),
(187, 7, 'Shapla Choudhury', 'A+', NULL, 'Nurul Choudhury', 'Rifat Sultana', 'Nurul Choudhury', '01765624220', 'Mirabazar, Sylhet', '2011-09-01', '20111027621267969', 13, 'Active', NULL),
(188, 8, 'Ishrat Kabir', 'A+', NULL, 'Rakib Kabir', 'Jannat Akter', 'Rakib Kabir', '01838468950', 'Shahjalal Uposhohor, Sylhet', '2011-10-23', '20110975197128478', 13, 'Active', NULL),
(189, 9, 'Maliha Uddin', 'B+', NULL, 'Kamal Ayaan Uddin', 'Sultana Parvin', 'Kamal Ayaan Uddin', '01695654420', 'Zindabazar, Sylhet', '2011-08-29', '20119494079290490', 13, 'Active', NULL),
(190, 10, 'Rafiq Hossain', 'O+', NULL, 'Rafiq Hossain', 'Lubna Khatun', 'Rafiq Hossain', '01729275243', 'Akhalia, Sylhet', '2012-01-08', '20127280512927663', 13, 'Active', NULL),
(191, 11, 'Nabila Islam', 'O-', NULL, 'Shamim Jamal Islam', 'Lubna Begum', 'Shamim Jamal Islam', '01883667428', 'Mendibag, Sylhet', '2012-08-31', '20126047658018569', 13, 'Active', NULL),
(192, 12, 'Nusrat Alam', 'A+', NULL, 'Rafiq Imran Alam', 'Lubna Parvin', 'Rafiq Imran Alam', '01825800106', 'Bondor Bazar, Sylhet', '2011-09-24', '20111817534430091', 13, 'Active', NULL),
(193, 13, 'Rubel Miah', 'A-', NULL, 'Shahin Miah', 'Rahima Begum', 'Shahin Miah', '01892124471', 'Mendibag, Sylhet', '2012-12-02', '20127465421406650', 13, 'Active', NULL),
(194, 14, 'Sanjida Alam', 'O-', NULL, 'Kamal Hasan Alam', 'Farhana Parvin', 'Kamal Hasan Alam', '01639174101', 'Bondor Bazar, Sylhet', '2011-03-15', '20111947072006425', 13, 'Active', NULL),
(195, 15, 'Nasrin Ahmed', 'O+', NULL, 'Hasan Ahmed', 'Mahiya Sultana', 'Hasan Ahmed', '01871985546', 'Shibganj, Sylhet', '2011-01-02', '20110158517432806', 13, 'Active', NULL);

-- Class 10 (Humanities) (class_id = 14)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(196, 1, 'Rakib Choudhury', 'AB+', NULL, 'Shamim Choudhury', 'Sanjida Begum', 'Shamim Choudhury', '01393761847', 'Mendibag, Sylhet', '2011-03-13', '20118700505061387', 14, 'Active', NULL),
(197, 2, 'Hasan Hossain', 'B+', NULL, 'Monir Hossain', 'Nasrin Begum', 'Nasrin Begum', '01703202041', 'Lamabazar, Sylhet', '2011-08-30', '20117929111799313', 14, 'Active', NULL),
(198, 3, 'Habibur Choudhury', 'A+', NULL, 'Siam Ayaan Choudhury', 'Halima Akter', 'Siam Ayaan Choudhury', '01314262582', 'Shahjalal Uposhohor, Sylhet', '2011-10-31', '20117390219620710', 14, 'Active', NULL),
(199, 4, 'Emon Uddin', 'AB+', NULL, 'Tawhid Uddin', 'Tania Sultana', 'Tawhid Uddin', '01587632909', 'Bondor Bazar, Sylhet', '2011-04-16', '20112791456083318', 14, 'Active', NULL),
(200, 5, 'Shapla Mia', 'O+', NULL, 'Ayaan Mia', 'Rima Khatun', 'Ayaan Mia', '01927722005', 'Kumarpara, Sylhet', '2012-01-28', '20124364597010822', 14, 'Active', NULL),
(201, 6, 'Sadia Rahman', 'O+', NULL, 'Tarek Rakib Rahman', 'Sadia Sultana', 'Tarek Rakib Rahman', '01336363179', 'Shibganj, Sylhet', '2011-02-26', '20117062397265273', 14, 'Active', NULL),
(202, 7, 'Nabila Miah', 'A+', NULL, 'Karim Siam Miah', 'Salma Akter', 'Karim Siam Miah', '01534929298', 'Uposhohor, Sylhet', '2012-08-02', '20123168739774063', 14, 'Active', NULL),
(203, 8, 'Tanvir Khan', 'B+', NULL, 'Tawhid Khan', 'Momena Parvin', 'Momena Parvin', '01880686717', 'Shibganj, Sylhet', '2011-01-21', '20117318063254310', 14, 'Active', NULL),
(204, 9, 'Halima Islam', 'A+', NULL, 'Siam Islam', 'Fatema Sultana', 'Siam Islam', '01570165804', 'Tilagor, Sylhet', '2012-04-04', '20126498931950850', 14, 'Active', NULL),
(205, 10, 'Kamal Sarker', 'B+', NULL, 'Liton Sarker', 'Tasnia Khatun', 'Tasnia Khatun', '01481793355', 'Mirabazar, Sylhet', '2011-03-12', '20114864015577881', 14, 'Active', NULL),
(206, 11, 'Rifat Ali', 'A+', NULL, 'Liton Kamal Ali', 'Farhana Sultana', 'Farhana Sultana', '01312412723', 'Mendibag, Sylhet', '2011-05-28', '20118046827567043', 14, 'Active', NULL),
(207, 12, 'Masud Khan', 'O+', NULL, 'Zahid Khan', 'Maliha Sultana', 'Zahid Khan', '01787749242', 'Shibganj, Sylhet', '2012-10-30', '20124375402547292', 14, 'Active', NULL),
(208, 13, 'Sadia Islam', 'AB+', NULL, 'Sohel Islam', 'Sumaiya Khatun', 'Sohel Islam', '01438055257', 'Mirabazar, Sylhet', '2011-08-14', '20118284106727520', 14, 'Active', NULL),
(209, 14, 'Siam Talukder', 'A+', NULL, 'Salim Talukder', 'Mahiya Akter', 'Salim Talukder', '01651702814', 'Shahjalal Uposhohor, Sylhet', '2011-10-17', '20110693751509398', 14, 'Active', NULL),
(210, 15, 'Sabbir Alam', 'B+', NULL, 'Faruk Ayaan Alam', 'Afia Begum', 'Faruk Ayaan Alam', '01780562656', 'Lamabazar, Sylhet', '2011-09-09', '20115045547813767', 14, 'Active', NULL);