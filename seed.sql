-- Sample data: 5 students per class (14 classes = 70 students)
-- Change table name `students` if yours is different

-- Play (class_id = 1)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(1, 1, 'Ayaan Rahman', 'AB+', NULL, 'Rafiq Tarek Rahman', 'Rumana Khatun', 'Rafiq Tarek Rahman', '01313389083', 'Tilagor, Sylhet', '2022-10-30', '20228637940265423', 1, 'Active', NULL),
(2, 2, 'Rokeya Rahman', 'A+', NULL, 'Imran Shamim Rahman', 'Anika Parvin', 'Imran Shamim Rahman', '01618495931', 'Shibganj, Sylhet', '2023-10-02', '20230341316475255', 1, 'Active', NULL),
(3, 3, 'Jannat Uddin', 'A-', NULL, 'Nasir Uddin', 'Tasfia Khatun', 'Nasir Uddin', '01450305641', 'Bondor Bazar, Sylhet', '2023-11-24', '20233953767242388', 1, 'Active', NULL),
(4, 4, 'Rubel Kabir', 'A+', NULL, 'Sabbir Kabir', 'Tasnia Khatun', 'Sabbir Kabir', '01912269166', 'Maulavi Bazar, Sylhet', '2023-02-16', '20239784801845146', 1, 'Active', NULL),
(5, 5, 'Arif Alam', 'O+', NULL, 'Anwar Alam', 'Rima Begum', 'Anwar Alam', '01488095701', 'Mirabazar, Sylhet', '2022-03-20', '20225430391171822', 1, 'Active', NULL);

-- Nursery (class_id = 2)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(16, 1, 'Puja Ahmed', 'B+', NULL, 'Imran Ahmed', 'Ishrat Khatun', 'Imran Ahmed', '01917278895', 'Subid Bazar, Sylhet', '2022-01-26', '20227986872774348', 2, 'Active', NULL),
(17, 2, 'Tasfia Alam', 'O+', NULL, 'Salim Tarek Alam', 'Mim Akter', 'Salim Tarek Alam', '01623166587', 'Mendibag, Sylhet', '2021-03-12', '20216036690967054', 2, 'Active', NULL),
(18, 3, 'Ishrat Kabir', 'B+', NULL, 'Ayaan Kabir', 'Rumana Sultana', 'Ayaan Kabir', '01862729806', 'Tilagor, Sylhet', '2022-01-15', '20229901627204653', 2, 'Active', NULL),
(19, 4, 'Tasfia Choudhury', 'AB+', NULL, 'Tanvir Jahid Choudhury', 'Shirin Sultana', 'Tanvir Jahid Choudhury', '01300330923', 'Zindabazar, Sylhet', '2021-06-29', '20212719374529912', 2, 'Active', NULL),
(20, 5, 'Mizanur Ahmed', 'O+', NULL, 'Siam Ahmed', 'Jannat Sultana', 'Siam Ahmed', '01831491905', 'Uposhohor, Sylhet', '2021-10-31', '20218651850671657', 2, 'Active', NULL);

-- Class 1 (class_id = 3)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(31, 1, 'Imran Uddin', 'O-', NULL, 'Salim Monir Uddin', 'Shirin Sultana', 'Salim Monir Uddin', '01305045562', 'Ambarkhana, Sylhet', '2021-03-27', '20213869222196937', 3, 'Active', NULL),
(32, 2, 'Sajib Khan', 'B+', NULL, 'Jahid Sajib Khan', 'Lubna Begum', 'Jahid Sajib Khan', '01375946474', 'Bondor Bazar, Sylhet', '2021-12-13', '20213671369594406', 3, 'Active', NULL),
(33, 3, 'Shamim Chowdhury', 'O+', NULL, 'Hasan Chowdhury', 'Tania Khatun', 'Hasan Chowdhury', '01521047095', 'Shibganj, Sylhet', '2020-11-21', '20202145623285884', 3, 'Active', NULL),
(34, 4, 'Nasrin Biswas', 'B+', NULL, 'Salim Biswas', 'Maliha Begum', 'Maliha Begum', '01868516048', 'Bondor Bazar, Sylhet', '2020-04-25', '20201754965137098', 3, 'Active', NULL),
(35, 5, 'Rokeya Khan', 'B+', NULL, 'Sajib Khan', 'Sultana Sultana', 'Sultana Sultana', '01313826758', 'Subid Bazar, Sylhet', '2020-06-04', '20206926179640537', 3, 'Active', NULL);

-- Class 2 (class_id = 4)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(46, 1, 'Jamal Mia', 'A+', NULL, 'Salim Nurul Mia', 'Samira Akter', 'Salim Nurul Mia', '01764492519', 'Pathantula, Sylhet', '2020-02-03', '20202546291486528', 4, 'Active', NULL),
(47, 2, 'Shapla Kabir', 'B+', NULL, 'Rahim Kabir', 'Tasnia Akter', 'Rahim Kabir', '01421418880', 'Akhalia, Sylhet', '2020-09-05', '20205929622292706', 4, 'Active', NULL),
(48, 3, 'Nusrat Khan', 'B+', NULL, 'Nayeem Khan', 'Tania Sultana', 'Tania Sultana', '01459774688', 'Lamabazar, Sylhet', '2020-08-28', '20206239240758181', 4, 'Active', NULL),
(49, 4, 'Monir Islam', 'O+', NULL, 'Mahfuz Sohel Islam', 'Ishrat Begum', 'Ishrat Begum', '01606853615', 'Shahjalal Uposhohor, Sylhet', '2020-06-27', '20203051522047277', 4, 'Active', NULL),
(50, 5, 'Tania Uddin', 'A+', NULL, 'Habibur Sohel Uddin', 'Puja Sultana', 'Habibur Sohel Uddin', '01469711798', 'Pathantula, Sylhet', '2019-06-04', '20190893246095396', 4, 'Active', NULL);

-- Class 3 (class_id = 5)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(61, 1, 'Mahfuz Talukder', 'O+', NULL, 'Zahid Talukder', 'Nabila Khatun', 'Nabila Khatun', '01526949588', 'Shibganj, Sylhet', '2018-06-17', '20188794705516940', 5, 'Active', NULL),
(62, 2, 'Nayeem Khan', 'AB-', NULL, 'Tawhid Khan', 'Mahiya Khatun', 'Tawhid Khan', '01409130756', 'Kumarpara, Sylhet', '2019-03-17', '20192636897028385', 5, 'Active', NULL),
(63, 3, 'Jahid Choudhury', 'A+', NULL, 'Anwar Sajib Choudhury', 'Tasfia Akter', 'Tasfia Akter', '01584344375', 'Akhalia, Sylhet', '2019-04-09', '20197584419866524', 5, 'Active', NULL),
(64, 4, 'Tasfia Uddin', 'B+', NULL, 'Rakib Jahid Uddin', 'Mahiya Khatun', 'Rakib Jahid Uddin', '01419933083', 'Subid Bazar, Sylhet', '2019-10-15', '20193016571208267', 5, 'Active', NULL),
(65, 5, 'Karim Ali', 'A+', NULL, 'Jamal Faruk Ali', 'Rumana Parvin', 'Rumana Parvin', '01406724004', 'Zindabazar, Sylhet', '2018-08-02', '20189915478872874', 5, 'Active', NULL);

-- Class 4 (class_id = 6)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(76, 1, 'Tarek Kabir', 'O+', NULL, 'Anwar Kabir', 'Jahanara Begum', 'Anwar Kabir', '01954615679', 'Zindabazar, Sylhet', '2017-11-14', '20173341016668700', 6, 'Active', NULL),
(77, 2, 'Monir Biswas', 'O+', NULL, 'Belal Biswas', 'Jahanara Parvin', 'Jahanara Parvin', '01640148902', 'Mirabazar, Sylhet', '2017-12-21', '20175039261429396', 6, 'Active', NULL),
(78, 3, 'Ishrat Talukder', 'A+', NULL, 'Rubel Faruk Talukder', 'Rima Akter', 'Rubel Faruk Talukder', '01999650477', 'Ambarkhana, Sylhet', '2017-02-08', '20173586629619431', 6, 'Active', NULL),
(79, 4, 'Shirin Choudhury', 'A+', NULL, 'Sohel Choudhury', 'Jannat Akter', 'Sohel Choudhury', '01941212678', 'Uposhohor, Sylhet', '2017-06-07', '20178861015819956', 6, 'Active', NULL),
(80, 5, 'Nurul Choudhury', 'A+', NULL, 'Rayhan Choudhury', 'Nusrat Parvin', 'Rayhan Choudhury', '01572126464', 'Uposhohor, Sylhet', '2017-03-13', '20177154379937124', 6, 'Active', NULL);

-- Class 5 (class_id = 7)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(91, 1, 'Rafiq Miah', 'O+', NULL, 'Rubel Miah', 'Sultana Khatun', 'Rubel Miah', '01352064361', 'Mendibag, Sylhet', '2016-12-01', '20161037129387005', 7, 'Active', NULL),
(92, 2, 'Jahanara Kabir', 'O+', NULL, 'Emon Kabir', 'Nasrin Khatun', 'Emon Kabir', '01526221890', 'Bondor Bazar, Sylhet', '2016-06-09', '20169275326973112', 7, 'Active', NULL),
(93, 3, 'Shirin Choudhury', 'O+', NULL, 'Fahim Masud Choudhury', 'Halima Khatun', 'Fahim Masud Choudhury', '01894043898', 'Maulavi Bazar, Sylhet', '2016-10-10', '20163640376137918', 7, 'Active', NULL),
(94, 4, 'Tasfia Mia', 'B+', NULL, 'Rubel Mia', 'Jannat Parvin', 'Jannat Parvin', '01910910430', 'Shibganj, Sylhet', '2016-08-29', '20160684866618892', 7, 'Active', NULL),
(95, 5, 'Nasrin Uddin', 'O+', NULL, 'Habibur Uddin', 'Momena Parvin', 'Habibur Uddin', '01930316179', 'Akhalia, Sylhet', '2017-12-24', '20179042102027588', 7, 'Active', NULL);

-- Class 6 (class_id = 8)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(106, 1, 'Nasrin Khan', 'B+', NULL, 'Imran Khan', 'Sanjida Khatun', 'Sanjida Khatun', '01415704331', 'Zindabazar, Sylhet', '2015-06-27', '20155410067626765', 8, 'Active', NULL),
(107, 2, 'Rokeya Biswas', 'A+', NULL, 'Siam Biswas', 'Rumana Khatun', 'Siam Biswas', '01315262181', 'Subid Bazar, Sylhet', '2016-01-11', '20165997062962015', 8, 'Active', NULL),
(108, 3, 'Jahanara Kabir', 'B+', NULL, 'Ayaan Kabir', 'Lubna Akter', 'Ayaan Kabir', '01972050614', 'Shahjalal Uposhohor, Sylhet', '2015-07-21', '20159731032417146', 8, 'Active', NULL),
(109, 4, 'Liton Alam', 'O+', NULL, 'Ayaan Nurul Alam', 'Tahmina Akter', 'Ayaan Nurul Alam', '01674349021', 'Subid Bazar, Sylhet', '2015-08-17', '20151586938068687', 8, 'Active', NULL),
(110, 5, 'Siam Biswas', 'O+', NULL, 'Sabbir Karim Biswas', 'Rima Parvin', 'Rima Parvin', '01622332061', 'Mirabazar, Sylhet', '2015-03-03', '20156329451168685', 8, 'Active', NULL);

-- Class 7 (class_id = 9)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(121, 1, 'Rokeya Alam', 'O+', NULL, 'Mizanur Alam', 'Anika Sultana', 'Mizanur Alam', '01653001197', 'Mendibag, Sylhet', '2015-04-17', '20152181143744701', 9, 'Active', NULL),
(122, 2, 'Imran Chowdhury', 'O+', NULL, 'Liton Chowdhury', 'Sadia Sultana', 'Sadia Sultana', '01825579415', 'Maulavi Bazar, Sylhet', '2014-01-05', '20145216674676212', 9, 'Active', NULL),
(123, 3, 'Shamim Islam', 'O+', NULL, 'Tawhid Emon Islam', 'Afia Khatun', 'Afia Khatun', '01827716701', 'Subid Bazar, Sylhet', '2014-12-17', '20144508993588916', 9, 'Active', NULL),
(124, 4, 'Nasir Biswas', 'A+', NULL, 'Nurul Sohel Biswas', 'Salma Begum', 'Salma Begum', '01375354083', 'Kumarpara, Sylhet', '2015-09-11', '20158663177971775', 9, 'Active', NULL),
(125, 5, 'Nayeem Ahmed', 'B+', NULL, 'Tanvir Karim Ahmed', 'Ayesha Begum', 'Tanvir Karim Ahmed', '01875503758', 'Akhalia, Sylhet', '2015-09-18', '20159975711305548', 9, 'Active', NULL);

-- Class 8 (class_id = 10)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(136, 1, 'Maliha Khan', 'A+', NULL, 'Fahim Khan', 'Mim Akter', 'Fahim Khan', '01947812914', 'Maulavi Bazar, Sylhet', '2014-08-25', '20142834110809969', 10, 'Active', NULL),
(137, 2, 'Rumana Alam', 'A+', NULL, 'Ayaan Alam', 'Mahiya Khatun', 'Ayaan Alam', '01716580392', 'Shibganj, Sylhet', '2014-03-10', '20148272299275037', 10, 'Active', NULL),
(138, 3, 'Nabila Mia', 'B+', NULL, 'Habibur Zahid Mia', 'Tasnia Sultana', 'Tasnia Sultana', '01518449892', 'Kumarpara, Sylhet', '2013-01-21', '20136659184638655', 10, 'Active', NULL),
(139, 4, 'Rima Ahmed', 'A+', NULL, 'Rubel Ahmed', 'Afia Khatun', 'Rubel Ahmed', '01459136517', 'Mirabazar, Sylhet', '2014-04-19', '20147739260302992', 10, 'Active', NULL),
(140, 5, 'Tahmina Chowdhury', 'O+', NULL, 'Sohel Chowdhury', 'Salma Khatun', 'Salma Khatun', '01804137977', 'Zindabazar, Sylhet', '2014-11-03', '20142369292984257', 10, 'Active', NULL);

-- Class 9 (Science) (class_id = 11)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(151, 1, 'Rima Miah', 'B+', NULL, 'Ayaan Miah', 'Tahmina Akter', 'Tahmina Akter', '01694722569', 'Kumarpara, Sylhet', '2013-08-17', '20139611253554496', 11, 'Active', NULL),
(152, 2, 'Fatema Mia', 'A+', NULL, 'Zahid Mia', 'Afia Sultana', 'Zahid Mia', '01813261117', 'Akhalia, Sylhet', '2012-04-30', '20128006811492164', 11, 'Active', NULL),
(153, 3, 'Anika Ali', 'B+', NULL, 'Rubel Rubel Ali', 'Puja Khatun', 'Rubel Rubel Ali', '01984872829', 'Uposhohor, Sylhet', '2013-09-01', '20139796884578317', 11, 'Active', NULL),
(154, 4, 'Mahiya Alam', 'A+', NULL, 'Abdul Abdul Alam', 'Puja Khatun', 'Puja Khatun', '01974064930', 'Pathantula, Sylhet', '2012-12-18', '20128536866326634', 11, 'Active', NULL),
(155, 5, 'Ayaan Khan', 'A+', NULL, 'Nayeem Khan', 'Mim Akter', 'Nayeem Khan', '01322417974', 'Kumarpara, Sylhet', '2013-07-31', '20139735020802144', 11, 'Active', NULL);

-- Class 9 (Humanities) (class_id = 12)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(166, 1, 'Ishrat Miah', 'O+', NULL, 'Zahid Miah', 'Nusrat Khatun', 'Nusrat Khatun', '01316655355', 'Ambarkhana, Sylhet', '2013-12-17', '20139042597927033', 12, 'Active', NULL),
(167, 2, 'Rahima Uddin', 'O+', NULL, 'Jamal Tarek Uddin', 'Momena Akter', 'Jamal Tarek Uddin', '01538338848', 'Bondor Bazar, Sylhet', '2013-08-19', '20137920698042043', 12, 'Active', NULL),
(168, 3, 'Liton Alam', 'B+', NULL, 'Abdul Kamal Alam', 'Jannat Akter', 'Abdul Kamal Alam', '01863681579', 'Akhalia, Sylhet', '2012-01-10', '20128123878003845', 12, 'Active', NULL),
(169, 4, 'Mahfuz Islam', 'B+', NULL, 'Shamim Shamim Islam', 'Sultana Khatun', 'Shamim Shamim Islam', '01608432562', 'Ambarkhana, Sylhet', '2013-02-01', '20131689363926495', 12, 'Active', NULL),
(170, 5, 'Arif Miah', 'A+', NULL, 'Tawhid Miah', 'Tasfia Khatun', 'Tasfia Khatun', '01929251881', 'Maulavi Bazar, Sylhet', '2012-08-08', '20122520566474231', 12, 'Active', NULL);

-- Class 10 (Science) (class_id = 13)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(181, 1, 'Sajib Rahman', 'O+', NULL, 'Zahid Rahman', 'Halima Khatun', 'Zahid Rahman', '01509157018', 'Shibganj, Sylhet', '2012-09-24', '20124094353344857', 13, 'Active', NULL),
(182, 2, 'Anika Hossain', 'A+', NULL, 'Shahin Abdul Hossain', 'Rima Begum', 'Shahin Abdul Hossain', '01849321495', 'Bondor Bazar, Sylhet', '2012-05-18', '20128702070160166', 13, 'Active', NULL),
(183, 3, 'Ayaan Sarker', 'A+', NULL, 'Arif Sarker', 'Maliha Khatun', 'Arif Sarker', '01371747733', 'Kumarpara, Sylhet', '2011-08-27', '20112945625577017', 13, 'Active', NULL),
(184, 4, 'Mahfuz Sarker', 'B+', NULL, 'Salim Sarker', 'Anika Parvin', 'Salim Sarker', '01915814876', 'Uposhohor, Sylhet', '2011-07-27', '20119639382761539', 13, 'Active', NULL),
(185, 5, 'Siam Talukder', 'O+', NULL, 'Tarek Talukder', 'Tahmina Begum', 'Tarek Talukder', '01658172461', 'Kumarpara, Sylhet', '2012-02-28', '20129196570132902', 13, 'Active', NULL);

-- Class 10 (Humanities) (class_id = 14)
INSERT INTO students (id, roll, name, blood_group, photo_path, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status, removal_cause) VALUES
(196, 1, 'Rakib Choudhury', 'AB+', NULL, 'Shamim Choudhury', 'Sanjida Begum', 'Shamim Choudhury', '01393761847', 'Mendibag, Sylhet', '2011-03-13', '20118700505061387', 14, 'Active', NULL),
(197, 2, 'Hasan Hossain', 'B+', NULL, 'Monir Hossain', 'Nasrin Begum', 'Nasrin Begum', '01703202041', 'Lamabazar, Sylhet', '2011-08-30', '20117929111799313', 14, 'Active', NULL),
(198, 3, 'Habibur Choudhury', 'A+', NULL, 'Siam Ayaan Choudhury', 'Halima Akter', 'Siam Ayaan Choudhury', '01314262582', 'Shahjalal Uposhohor, Sylhet', '2011-10-31', '20117390219620710', 14, 'Active', NULL),
(199, 4, 'Emon Uddin', 'AB+', NULL, 'Tawhid Uddin', 'Tania Sultana', 'Tawhid Uddin', '01587632909', 'Bondor Bazar, Sylhet', '2011-04-16', '20112791456083318', 14, 'Active', NULL),
(200, 5, 'Shapla Mia', 'O+', NULL, 'Ayaan Mia', 'Rima Khatun', 'Ayaan Mia', '01927722005', 'Kumarpara, Sylhet', '2012-01-28', '20124364597010822', 14, 'Active', NULL);














-- INSERT queries for subjects table

INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (19, 8, 'Bangla 1st', 1, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (20, 8, 'Bangla 2nd', 2, 25, 50);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (21, 8, 'English 1st', 3, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (22, 8, 'English 2nd', 4, 25, 50);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (23, 8, 'Math', 5, 50, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (24, 8, 'Science', 6, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (25, 8, 'Bangladesh & Global Studies', 7, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (26, 8, 'Agriculture/Domestic Science', 10, 25, 50);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (27, 8, 'Religious Studies and Moral Education', 9, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (28, 8, 'Information and Communication Technology', 8, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (29, 8, 'Clothes/Manner/Presence', 11, 25, 50);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (30, 9, 'Bangla 1st', 1, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (31, 9, 'Bangla 2nd', 1, 25, 50);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (32, 9, 'English 1st', 3, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (33, 9, 'English 2nd', 4, 25, 50);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (34, 9, 'Math', 5, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (35, 9, 'Science', 6, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (36, 9, 'Bangladesh & Global Studies', 7, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (37, 9, 'Information and Communication Technology', 8, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (38, 9, 'Religious Studies and Moral Education', 9, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (39, 9, 'Agriculture/Home Science', 10, 25, 50);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (40, 9, 'Clothes/Manner/Presence', 11, 25, 50);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (41, 1, 'Bangla', 1, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (42, 1, 'English', 2, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (43, 1, 'Math', 3, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (44, 1, 'Religious Studies and Moral Education', 4, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (45, 1, 'General Knowledge', 5, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (46, 1, 'Spoken', 6, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (47, 1, 'Drawing', 7, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (49, 2, 'Bangla', 1, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (50, 2, 'English', 2, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (51, 2, 'Math', 3, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (52, 2, 'Religious Studies and Moral Education', 4, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (53, 2, 'General Knowledge', 5, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (54, 2, 'Spoken', 6, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (55, 2, 'Drawing', 7, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (56, 2, 'Clothes/Manner/Presence', 8, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (57, 3, 'Bangla', 1, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (58, 3, 'English', 2, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (59, 3, 'Math', 3, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (60, 3, 'Religious Studies and Moral Education', 4, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (61, 3, 'General Knowledge', 5, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (62, 3, 'Spoken', 6, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (63, 3, 'Drawing', 7, NULL, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (64, 3, 'Clothes/Manner/Presence', 8, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (65, 4, 'Bangla', 1, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (66, 4, 'English', 2, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (72, 4, 'Math', 3, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (73, 4, 'Religious Studies and Moral Education', 4, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (74, 4, 'General Knowledge', 5, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (75, 4, 'Spoken', 6, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (76, 4, 'Drawing', 7, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (77, 4, 'Clothes/Manner/Presence', 8, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (78, 5, 'Bangla 1st', 1, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (79, 5, 'Bangla 2nd', 2, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (80, 5, 'English 1st', 3, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (81, 5, 'English 2nd', 4, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (82, 5, 'Math', 5, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (83, 5, 'Science', 6, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (84, 5, 'Bangladesh & Global Studies', 7, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (85, 5, 'General Knowledge', 9, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (86, 5, 'Spoken', 10, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (87, 5, 'Drawing', 11, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (89, 5, 'Clothes/Manner/Presence', 12, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (90, 6, 'Bangla 1st', 1, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (91, 6, 'Bangla 2nd', 2, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (92, 6, 'English 1st', 3, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (93, 6, 'English 2nd', 4, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (94, 6, 'Math', 5, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (95, 6, 'Science', 6, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (96, 6, 'Bangladesh & Global Studies', 7, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (97, 6, 'General Knowledge', 9, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (98, 6, 'Religious Studies and Moral Education', 8, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (99, 5, 'Religious Studies and Moral Education', 8, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (100, 6, 'Drawing', 11, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (101, 6, 'Spoken', 10, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (103, 1, 'Clothes/Manner/Presence', 12, 50, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (105, 6, 'Clothes/Manner/Presence', 12, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (106, 10, 'Bangla 1st', 1, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (107, 10, 'Bangla 2nd', 2, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (108, 10, 'English 1st', 3, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (109, 10, 'English 2nd', 4, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (110, 10, 'Math', 5, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (111, 10, 'Science', 6, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (112, 10, 'Bangladesh & Global Studies', 7, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (113, 10, 'Information and Communication Technology', 8, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (115, 10, 'Agriculture/Home Science', 10, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (116, 10, 'Clothes/Manner/Presence', 11, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (117, 10, 'Bangla 1st', 9, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (118, 11, 'Bangla 1st', 1, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (119, 11, 'Bangla 2nd', 2, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (120, 11, 'English 1st', 3, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (121, 11, 'English 2nd', 4, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (122, 11, 'Math', 5, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (123, 11, 'Information and Communication Technology', 6, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (124, 11, 'Religious Studies and Moral Education', 7, 25, 100);
INSERT INTO subjects (class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (11, 'Physical Education, Health Science and Sports', 8, 25, 100);
INSERT INTO subjects (class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (11, 'Career Education', 9, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (125, 12, 'Bangla 1st', 1, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (126, 12, 'Bangla 2nd', 2, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (127, 12, 'English 1st', 3, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (128, 12, 'English 2nd', 4, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (129, 12, 'Math', 5, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (130, 12, 'Information and Communication Technology', 6, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (131, 12, 'Religious Studies and Moral Education', 7, 25, NULL);
INSERT INTO subjects (class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (12, 'Physical Education, Health Science and Sports', 8, 25, 100);
INSERT INTO subjects (class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (12, 'Career Education', 9, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (132, 13, 'Bangla 1st', 1, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (133, 13, 'Bangla 2nd', 2, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (134, 13, 'English 1st', 3, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (135, 13, 'English 2nd', 4, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (136, 13, 'Math', 5, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (137, 13, 'Information and Communication Technology', 6, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (138, 13, 'Religious Studies and Moral Education', 7, 25, NULL);
INSERT INTO subjects (class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (13, 'Physical Education, Health Science and Sports', 8, 25, 100);
INSERT INTO subjects (class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (13, 'Career Education', 9, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (139, 14, 'Bangla 1st', 1, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (140, 14, 'Bangla 2nd', 2, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (141, 14, 'English 1st', 3, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (142, 14, 'English 2nd', 4, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (143, 14, 'Math', 5, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (144, 14, 'Information and Communication Technology', 6, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (145, 14, 'Religious Studies and Moral Education', 7, 25, 100);
INSERT INTO subjects (class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (14, 'Physical Education, Health Science and Sports', 8, 25, 100);
INSERT INTO subjects (class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (14, 'Career Education', 9, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (146, 11, 'Physics', 11, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (147, 11, 'Chemistry', 12, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (148, 11, 'Biology', 13, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (149, 11, 'Higher Math', 14, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (150, 11, 'Agriculture/Home Science', 15, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (151, 11, 'Clothes/Manner/Presence', 16, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (152, 13, 'Physics', 11, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (153, 13, 'Chemistry', 12, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (154, 13, 'Biology', 13, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (155, 13, 'Higher Math', 14, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (156, 13, 'Agriculture/Home Science', 15, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (157, 13, 'Clothes/Manner/Presence', 16, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (158, 12, 'History', 11, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (159, 12, 'Geography & Environment', 12, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (160, 12, 'Civics & Citizenship', 13, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (161, 12, 'Economics', 14, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (162, 12, 'Agriculture/Home Science', 15, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (163, 12, 'Clothes/Manner/Presence', 16, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (164, 14, 'History', 11, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (165, 14, 'Geography & Environment', 12, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (166, 14, 'Civics & Citizenship', 13, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (167, 14, 'Economics', 14, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (168, 14, 'Agriculture/Home Science', 15, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (169, 14, 'Clothes/Manner/Presence', 16, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (171, 1, 'Physical Education', 13, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (172, 8, 'Physical Education', 12, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (174, 4, 'Physical Education', 9, 23, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (175, 7, 'Bangla 1st', 1, 25, NULL);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (176, 11, 'Bangladesh & Global Studies', 10, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (177, 12, 'Science', 10, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (178, 13, 'Bangladesh & Global Studies', 10, 25, 100);
INSERT INTO subjects (id, class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (179, 14, 'Science', 10, 25, 100);







-- INSERT queries for teachers table
-- Covers all subject areas: Bangla, English, Math, Science, ICT, Religious Ed,
-- BGS, Physics, Chemistry, Biology, Higher Math, History, Geography, Civics,
-- Economics, Agriculture, Drawing, Physical Education, etc.

INSERT INTO teachers (id, name, title, signature_path, fathers_name, mothers_name, photo_path, contact_number, blood_group, nid_number, address, teacher_id_number) VALUES (1, 'Md. Rafiqul Islam', 'Mr.', NULL, 'Md. Sirajul Islam', 'Fatema Begum', NULL, '01711234567', 'B+', '1991234567890', 'Mirpur, Dhaka', 'T-2027-01');

INSERT INTO teachers (id, name, title, signature_path, fathers_name, mothers_name, photo_path, contact_number, blood_group, nid_number, address, teacher_id_number) VALUES (2, 'Nasrin Akter', 'Mrs.', NULL, 'Md. Abul Kalam', 'Rahela Begum', NULL, '01812345678', 'O+', '1992345678901', 'Dhanmondi, Dhaka', 'T-2027-02');

INSERT INTO teachers (id, name, title, signature_path, fathers_name, mothers_name, photo_path, contact_number, blood_group, nid_number, address, teacher_id_number) VALUES (3, 'Md. Shafiqul Hasan', 'Mr.', NULL, 'Md. Nurul Hasan', 'Amina Begum', NULL, '01913456789', 'A+', '1993456789012', 'Mohammadpur, Dhaka', 'T-2027-03');

INSERT INTO teachers (id, name, title, signature_path, fathers_name, mothers_name, photo_path, contact_number, blood_group, nid_number, address, teacher_id_number) VALUES (4, 'Sultana Parvin', 'Mrs.', NULL, 'Md. Jahurul Islam', 'Sufia Begum', NULL, '01614567890', 'AB+', '1994567890123', 'Uttara, Dhaka', 'T-2027-04');

INSERT INTO teachers (id, name, title, signature_path, fathers_name, mothers_name, photo_path, contact_number, blood_group, nid_number, address, teacher_id_number) VALUES (5, 'Md. Kamrul Hossain', 'Mr.', NULL, 'Md. Fazlul Hossain', 'Hasina Begum', NULL, '01715678901', 'B-', '1995678901234', 'Gulshan, Dhaka', 'T-2027-05');














-- INSERT queries for classes table
-- (with class_teacher_id assigned from sample teachers)

UPDATE classes SET class_teacher_id = 1 WHERE id = 1;
UPDATE classes SET class_teacher_id = 2 WHERE id = 2;
UPDATE classes SET class_teacher_id = 2  WHERE id = 3;
UPDATE classes SET class_teacher_id = 4 WHERE id = 4;
UPDATE classes SET class_teacher_id = 1  WHERE id = 5;
UPDATE classes SET class_teacher_id = 1  WHERE id = 6;
UPDATE classes SET class_teacher_id = 3  WHERE id = 7;
UPDATE classes SET class_teacher_id = 3  WHERE id = 8;
UPDATE classes SET class_teacher_id = 4  WHERE id = 9;
UPDATE classes SET class_teacher_id = 5  WHERE id = 10;
UPDATE classes SET class_teacher_id = 1  WHERE id = 11;
UPDATE classes SET class_teacher_id = 2 WHERE id = 12;
UPDATE classes SET class_teacher_id = 5  WHERE id = 13;
UPDATE classes SET class_teacher_id = 4 WHERE id = 14;